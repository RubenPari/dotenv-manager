/**
 * Environment commands
 * @module cli/commands/env
 * @description Commands to list and select the active environment for the current project.
 */
import chalk from 'chalk';
import ora from 'ora';
import { getApiClient } from '../api/client';
import { writeLocalConfig, getActiveEnv } from '../config';
import { requireLocalConfig } from '../utils/requireLocalConfig';
import { getErrorMessage } from '../utils/errors';
import type { Project } from '@dotenv-manager/shared';

/**
 * `dm env list` action.
 */
export async function envListAction(): Promise<void> {
  const localConfig = requireLocalConfig();

  const spinner = ora('Loading environments...').start();

  try {
    const api = getApiClient();
    const { data: projects } = await api.get<Project[]>('/api/v1/projects');
    const project = projects.find((p) => p.slug === localConfig.projectSlug);

    if (!project) {
      spinner.fail(chalk.red('Project not found'));
      process.exit(1);
    }

    spinner.stop();
    console.log(chalk.bold('\nEnvironments:'));
    for (const env of project.envs) {
      const active = env.name === getActiveEnv(localConfig) ? chalk.green(' (active)') : '';
      console.log(`  ${env.name}${active}`);
    }
    console.log();
  } catch (error: unknown) {
    spinner.fail(chalk.red(getErrorMessage(error, 'Failed to load environments')));
    process.exit(1);
  }
}

/**
 * `dm env use <name>` action.
 * @param name - Environment name to set as active.
 */
export async function envUseAction(name: string): Promise<void> {
  const localConfig = requireLocalConfig();

  writeLocalConfig({ ...localConfig, env: name });
  console.log(chalk.green(`Active environment set to: ${name}`));
}
