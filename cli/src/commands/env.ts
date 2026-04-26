import chalk from 'chalk';
import ora from 'ora';
import { getApiClient } from '../api/client';
import { readLocalConfig, writeLocalConfig, getActiveEnv } from '../config';

export async function envListAction(): Promise<void> {
  const localConfig = readLocalConfig();
  if (!localConfig) {
    console.log(chalk.red('Not initialized. Run `dm init` first.'));
    process.exit(1);
  }

  const spinner = ora('Loading environments...').start();

  try {
    const api = getApiClient();
    const { data: projects } = await api.get('/api/v1/projects');
    const project = projects.find((p: any) => p.slug === localConfig.projectSlug);

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
  } catch (error: any) {
    spinner.fail(chalk.red(error.response?.data?.error || 'Failed to load environments'));
    process.exit(1);
  }
}

export async function envUseAction(name: string): Promise<void> {
  const localConfig = readLocalConfig();
  if (!localConfig) {
    console.log(chalk.red('Not initialized. Run `dm init` first.'));
    process.exit(1);
  }

  writeLocalConfig({ ...localConfig, env: name });
  console.log(chalk.green(`Active environment set to: ${name}`));
}
