import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { getApiClient } from '../api/client';
import { readLocalConfig, writeLocalConfig, readCredentials } from '../config';

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
      { type: 'input', name: 'slug', message: 'Project slug:', validate: (v: string) => v.length > 0 || 'Required' },
    ]);
    projectSlug = slug;
  }

  const spinner = ora('Linking project...').start();

  try {
    const api = getApiClient();
    
    // Find project by slug
    const { data: projects } = await api.get('/api/v1/projects');
    const project = projects.find((p: any) => p.slug === projectSlug);

    if (!project) {
      spinner.fail(chalk.red(`Project "${projectSlug}" not found. Create it in the Web UI first.`));
      process.exit(1);
    }

    writeLocalConfig({ projectSlug: projectSlug! });
    spinner.succeed(chalk.green(`Project "${projectSlug}" linked. Environments: dev, staging, prod`));
  } catch (error: any) {
    spinner.fail(chalk.red(error.response?.data?.error || 'Failed to link project'));
    process.exit(1);
  }
}
