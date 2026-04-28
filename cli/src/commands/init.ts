/**
 * Init command
 * @module cli/commands/init
 * @description Links the current directory to an existing project and writes local config.
 */
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getApiClient } from '../api/client';
import { readLocalConfig, writeLocalConfig, readCredentials } from '../config';
import { withSpinner } from '../utils/withSpinner';
import type { Project } from '@rubenpari/dotenv-cli-shared';

/**
 * `dm init` action.
 * @param opts - Options provided by commander.
 */
export async function initAction(opts: { project?: string }): Promise<void> {
  const existing = readLocalConfig();
  if (existing) {
    console.log(chalk.yellow(`Project already initialized: ${existing.projectSlug}`));
    return;
  }

  const credentials = readCredentials();
  if (!credentials.accessToken) {
    console.log(chalk.red('Not authenticated. Run `dm login` first.'));
    process.exit(1);
  }

  let projectSlug = opts.project;

  if (!projectSlug) {
    const { slug } = await inquirer.prompt([
      {
        type: 'input',
        name: 'slug',
        message: 'Project slug:',
        validate: (v: string) => v.length > 0 || 'Required',
      },
    ]);
    projectSlug = slug;
  }

  await withSpinner('Linking project...', async (spinner) => {
    const api = getApiClient();

    const { data: projects } = await api.get<Project[]>('/api/v1/projects');
    const project = projects.find((p) => p.slug === projectSlug);

    if (!project) {
      spinner.fail(chalk.red(`Project "${projectSlug}" not found. Create it in the Web UI first.`));
      process.exit(1);
    }

    writeLocalConfig({ projectSlug: projectSlug! });
    spinner.succeed(
      chalk.green(`Project "${projectSlug}" linked. Environments: dev, staging, prod`),
    );
  });
}
