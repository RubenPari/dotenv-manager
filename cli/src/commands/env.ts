/**
 * Environment commands
 * @module cli/commands/env
 * @description Commands to list and select the active environment for the current project.
 */
import chalk from 'chalk';
import { getApiClient } from '../api/client';
import { writeLocalConfig, getActiveEnv } from '../config';
import { requireLocalConfig } from '../utils/requireLocalConfig';
import { withSpinner } from '../utils/withSpinner';
import type { Project } from '@rubenpari/dotenv-cli-shared';

/**
 * `dm env list` action.
 */
export async function envListAction(): Promise<void> {
  const localConfig = requireLocalConfig();

  await withSpinner('Loading environments...', async (spinner) => {
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
  });
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
