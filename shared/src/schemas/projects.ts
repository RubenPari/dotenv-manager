import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  envs: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      _count: z.object({ variables: z.number().int().nonnegative() }).optional(),
    })
  ),
});

export const CreateProjectRequestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const UpdateProjectRequestSchema = CreateProjectRequestSchema;

export const EnvSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
});

export const CreateEnvRequestSchema = z.object({
  name: z.string().min(1).max(50),
});

export const VariableInputSchema = z.object({
  key: z.string().min(1).max(200),
  value: z.string().optional(),
  isSecret: z.boolean().default(false),
  isRequired: z.boolean().default(false),
  description: z.string().max(500).optional(),
});

export const VariableResponseSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string().nullable().optional(),
  isSecret: z.boolean(),
  isRequired: z.boolean(),
  description: z.string().nullable().optional(),
});

export const DiffEntrySchema = z.object({
  key: z.string(),
  status: z.enum(['added', 'removed', 'modified', 'unchanged']),
  env1: z.string().optional().nullable(),
  env2: z.string().optional().nullable(),
});

export type Project = z.infer<typeof ProjectSchema>;
export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;
export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequestSchema>;
export type Env = z.infer<typeof EnvSchema>;
export type CreateEnvRequest = z.infer<typeof CreateEnvRequestSchema>;
export type VariableInput = z.infer<typeof VariableInputSchema>;
export type VariableResponse = z.infer<typeof VariableResponseSchema>;
export type DiffEntry = z.infer<typeof DiffEntrySchema>;

