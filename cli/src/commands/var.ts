/**
 * Variable commands
 * @module cli/commands/var
 * @description Commands to manage environment variables via the API.
 */
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { getApiClient, getProjectIdBySlug } from '../api/client';
import { getActiveEnv } from '../config';
import { requireLocalConfig } from '../utils/requireLocalConfig';
import { getErrorMessage } from '../utils/errors';
import type { VariableResponse, VariableInput } from '@dotenv-manager/shared';

/**
 * `dm var add <KEY>` action.
 * @param key - Variable key to create/update.
 */
export async function varAddAction(key: string): Promise<void> {
  const localConfig = requireLocalConfig();

  const { value, isSecret, description } = await inquirer.prompt([
    { type: 'password', name: 'value', message: `Value for ${key}:`, mask: '*' },
    { type: 'confirm', name: 'isSecret', message: 'Is this a secret?', default: true },
    { type: 'input', name: 'description', message: 'Description (optional):' },
  ]);

  const spinner = ora('Adding variable...').start();

  try {
    const api = getApiClient();
    const env = getActiveEnv(localConfig);
    const projectId = await getProjectIdBySlug(localConfig.projectSlug);

    const { data: existing } = await api.get<VariableResponse[]>(
      `/api/v1/projects/${projectId}/envs/${env}`,
    );

    const variables: VariableInput[] = existing.map((v) => ({
      key: v.key,
      value: v.value || '',
      isSecret: v.isSecret,
      isRequired: v.isRequired,
      description: v.description ?? undefined,
    }));

    const idx = variables.findIndex((v) => v.key === key);
    const newVar: VariableInput = {
      key,
      value: isSecret ? '' : value,
      isSecret,
      isRequired: false,
      description: description || '',
    };

    if (idx >= 0) {
      variables[idx] = newVar;
    } else {
      variables.push(newVar);
    }

    await api.put(`/api/v1/projects/${projectId}/envs/${env}`, variables);

    spinner.succeed(chalk.green(`${key} added${isSecret ? ' (encrypted)' : ''}`));
  } catch (error: unknown) {
    spinner.fail(chalk.red(getErrorMessage(error, 'Failed to add variable')));
    process.exit(1);
  }
}

/**
 * `dm var get <KEY>` action.
 * @param key - Variable key to fetch.
 */
export async function varGetAction(key: string): Promise<void> {
  const localConfig = requireLocalConfig();

  const spinner = ora('Fetching variable...').start();

  try {
    const api = getApiClient();
    const env = getActiveEnv(localConfig);
    const projectId = await getProjectIdBySlug(localConfig.projectSlug);

    const { data: variables } = await api.get<VariableResponse[]>(
      `/api/v1/projects/${projectId}/envs/${env}`,
    );
    const variable = variables.find((v) => v.key === key);

    if (!variable) {
      spinner.fail(chalk.red(`${key} not found`));
      process.exit(1);
    }

    spinner.stop();
    if (variable.isSecret) {
      const { show } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'show',
          message: `${key} is a secret. Show value?`,
          default: false,
        },
      ]);
      if (show) {
        console.log(`${key}=${variable.value || '[stored encrypted]'}`);
      }
    } else {
      console.log(`${key}=${variable.value}`);
    }
  } catch (error: unknown) {
    spinner.fail(chalk.red(getErrorMessage(error, 'Failed to fetch variable')));
    process.exit(1);
  }
}

/**
 * `dm var list` action.
 * @param opts - Options provided by commander.
 */
export async function varListAction(opts: { env?: string }): Promise<void> {
  const localConfig = requireLocalConfig();

  const spinner = ora('Loading variables...').start();
  const env = getActiveEnv(localConfig, opts.env);

  try {
    const api = getApiClient();
    const projectId = await getProjectIdBySlug(localConfig.projectSlug);
    const { data: variables } = await api.get<VariableResponse[]>(
      `/api/v1/projects/${projectId}/envs/${env}`,
    );

    spinner.stop();
    if (variables.length === 0) {
      console.log(chalk.yellow('No variables found.'));
      return;
    }

    console.log(chalk.bold(`\nVariables (${env}):\n`));
    console.log(chalk.gray('  KEY'.padEnd(30) + 'VALUE'.padEnd(40) + 'SECRET'));
    console.log('  ' + '-'.repeat(70));

    for (const v of variables) {
      const key = v.key.padEnd(30);
      const value = v.isSecret ? '[secret] ✓' : (v.value || '').substring(0, 39).padEnd(40);
      console.log(`  ${key}${value}`);
    }
    console.log();
  } catch (error: unknown) {
    spinner.fail(chalk.red(getErrorMessage(error, 'Failed to load variables')));
    process.exit(1);
  }
}
