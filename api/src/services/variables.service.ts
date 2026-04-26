/**
 * Variables service
 * @module api/services/variables.service
 * @description Contains the variables service functions
 */
import { z } from 'zod';
import prisma from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { decryptVariable, encryptVariable } from './crypto.service';
import { formatExport, type ExportFormat } from '@dotenv-manager/shared';

/**
 * The schema for a variable
 * @param key - The key of the variable
 * @param value - The value of the variable
 * @param isSecret - Whether the variable is a secret
 * @param isRequired - Whether the variable is required
 * @param description - The description of the variable
 */
const variableSchema = z.object({
  key: z.string().min(1).max(200),
  value: z.string().optional(),
  isSecret: z.boolean().default(false),
  isRequired: z.boolean().default(false),
  description: z.string().max(500).optional(),
});

/**
 * Parse the variable inputs
 * @param body - The body of the request
 * @returns The parsed variables
 */
export function parseVariableInputs(body: unknown) {
  return z.array(variableSchema).parse(body);
}

/**
 * Convert a variable to a response object
 * @param v - The variable
 * @returns The response object
 */
export function toVariableResponse(v: {
  id: string;
  key: string;
  value: string | null;
  isSecret: boolean;
  isRequired: boolean;
  description: string | null;
}) {
  return {
    id: v.id,
    key: v.key,
    value: v.isSecret ? null : v.value,
    isSecret: v.isSecret,
    isRequired: v.isRequired,
    description: v.description,
  };
}

/**
 * Upsert the variables for an environment
 * @param params - The parameters object
 * @param params.envId - The environment ID
 * @param params.userId - The user ID
 * @param params.variables - The variables to upsert
 * @returns The upserted variables
 */
export async function upsertEnvVariables(params: {
  envId: string;
  userId: string;
  variables: Array<z.infer<typeof variableSchema>>;
}) {
  // Get the new keys
  const newKeys = new Set(params.variables.map((v) => v.key));

  // Delete the variables that are not in the new keys
  return prisma.$transaction(async (tx) => {
    await tx.variable.deleteMany({
      where: { envId: params.envId, key: { notIn: [...newKeys] } },
    });

    // Upsert the variables
    const results = [];
    for (const v of params.variables) {
      const existing = await tx.variable.findUnique({
        where: { envId_key: { envId: params.envId, key: v.key } },
      });

      // Get the value encrypted and value
      let valueEncrypted = existing?.valueEncrypted ?? null;
      let value: string | null | undefined = v.value ?? null;

      // If the variable is secret, encrypt the value
      if (v.isSecret && v.value) {
        valueEncrypted = encryptVariable(v.value);
        value = null;
      }

      // Get the action
      const action = existing ? 'UPDATE' : 'CREATE';
      const variable = await tx.variable.upsert({
        where: { envId_key: { envId: params.envId, key: v.key } },
        create: {
          envId: params.envId,
          key: v.key,
          value,
          valueEncrypted,
          isSecret: v.isSecret,
          isRequired: v.isRequired,
          description: v.description,
        },
        update: {
          value,
          valueEncrypted,
          isSecret: v.isSecret,
          isRequired: v.isRequired,
          description: v.description,
        },
      });

      // Create the audit log
      await tx.auditLog.create({
        data: {
          envId: params.envId,
          action,
          key: v.key,
          actorId: params.userId,
        },
      });

      results.push(variable);
    }

    return results;
  });
}

/**
 * Export the variables for an environment
 * @param params - The parameters object
 * @param params.envId - The environment ID
 * @param params.format - The format to export
 * @returns The exported variables
 */
export async function exportEnv(params: { envId: string; format: ExportFormat }) {
  const env = await prisma.env.findUnique({
    where: { id: params.envId },
    include: { variables: { orderBy: { key: 'asc' } } },
  });
  if (!env) throw new AppError(404, 'Environment not found');

  const variables = await Promise.all(
    env.variables.map(async (v) => ({
      key: v.key,
      value: v.isSecret && v.valueEncrypted ? decryptVariable(v.valueEncrypted) : v.value || '',
    })),
  );

  return formatExport(variables, params.format);
}


/**
 * Diff the variables for two environments
 * @param params - The parameters object
 * @param params.envId1 - The first environment ID
 * @param params.envId2 - The second environment ID
 * @returns The diff
 */
export async function diffEnvs(params: { envId1: string; envId2: string }) {
  // Get the environments
  const [env1, env2] = await Promise.all([
    prisma.env.findUnique({ where: { id: params.envId1 }, include: { variables: true } }),
    prisma.env.findUnique({ where: { id: params.envId2 }, include: { variables: true } }),
  ]);
  if (!env1 || !env2) throw new AppError(404, 'One or both environments not found');

  // Get the variables
  const vars1 = new Map(env1.variables.map((v) => [v.key, v]));
  const vars2 = new Map(env2.variables.map((v) => [v.key, v]));
  const allKeys = new Set([...vars1.keys(), ...vars2.keys()]);

  // Get the diff
  const diff = [];
  for (const key of allKeys) {
    const v1 = vars1.get(key);
    const v2 = vars2.get(key);

    // If the variable is not in the first environment, add it to the diff
    if (!v1) {
      diff.push({ key, status: 'added', env1: undefined, env2: v2?.value || '[secret]' });
    // If the variable is not in the second environment, add it to the diff
    } else if (!v2) {
      diff.push({ key, status: 'removed', env1: v1.value || '[secret]', env2: undefined });
    // If the variable is different in the two environments, add it to the diff
    } else if (v1.value !== v2.value || v1.valueEncrypted !== v2.valueEncrypted) {
      diff.push({
        key,
        status: 'modified',
        env1: v1.value || '[secret]',
        env2: v2.value || '[secret]',
      });
    // If the variable is the same in the two environments, add it to the diff
    } else {
      diff.push({
        key,
        status: 'unchanged',
        env1: v1.value || '[secret]',
        env2: v2.value || '[secret]',
      });
    }
  }

  return diff;
}

/**
 * Import the content for an environment
 * @param params - The parameters object
 * @param params.envId - The environment ID
 * @param params.userId - The user ID
 * @param params.content - The content to import
 * @returns The imported variables
 */
export async function importEnvContent(params: { envId: string; userId: string; content: string }) {
  const variables: Array<{ key: string; value: string }> = [];
  // Parse the content
  for (const line of params.content.split('\n')) {
    // Skip blank lines and comments
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    // Split the line into key and value
    const [key, ...rest] = trimmed.split('=');
    // Remove quotes from the value
    const value = rest.join('=').replace(/^["']|["']$/g, '');
    // If the key and value are not empty, add them to the variables
    if (key && value) variables.push({ key: key.trim(), value });
  }

  // Upsert the variables
  await prisma.$transaction(async (tx) => {
    for (const v of variables) {
      // Upsert the variable
      await tx.variable.upsert({
        where: { envId_key: { envId: params.envId, key: v.key } },
        create: {
          envId: params.envId,
          key: v.key,
          value: v.value,
          isSecret: false,
        },
        update: { value: v.value },
      });

      // Create the audit log
      await tx.auditLog.create({
        data: { envId: params.envId, action: 'IMPORT', key: v.key, actorId: params.userId },
      });
    }
  });

  return { imported: variables.length };
}
