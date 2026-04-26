import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';
import { getApiClient, getProjectIdBySlug } from '../api/client';
import { readLocalConfig, getActiveEnv } from '../config';

export async function pushAction(opts: { env?: string }): Promise<void> {
  const localConfig = readLocalConfig();
  if (!localConfig) {
    console.log(chalk.red('Not initialized. Run `dm init` first.'));
    process.exit(1);
  }

  const envFile = '.env';
  if (!fs.existsSync(envFile)) {
    console.log(chalk.red('.env file not found'));
    process.exit(1);
  }

  const spinner = ora('Syncing to backend...').start();
  const env = getActiveEnv(localConfig, opts.env);

  try {
    const envConfig = dotenv.parse(fs.readFileSync(envFile));
    const projectId = await getProjectIdBySlug(localConfig.projectSlug);
    
    const variables = Object.entries(envConfig).map(([key, value]) => ({
      key,
      value,
      isSecret: false,
      isRequired: false,
      description: '',
    }));

    const api = getApiClient();
    const { data } = await api.put(`/api/v1/projects/${projectId}/envs/${env}`, variables);

    const secrets = variables.filter(v => v.isSecret).length;
    spinner.succeed(chalk.green(`${variables.length} variables synchronized (${secrets} encrypted)`));
  } catch (error: any) {
    spinner.fail(chalk.red(error.response?.data?.error || 'Failed to sync'));
    process.exit(1);
  }
}

export async function pullAction(opts: { env?: string }): Promise<void> {
  const localConfig = readLocalConfig();
  if (!localConfig) {
    console.log(chalk.red('Not initialized. Run `dm init` first.'));
    process.exit(1);
  }

  const spinner = ora('Downloading variables...').start();
  const env = getActiveEnv(localConfig, opts.env);

  try {
    const api = getApiClient();
    const projectId = await getProjectIdBySlug(localConfig.projectSlug);
    const { data: variables } = await api.get(`/api/v1/projects/${projectId}/envs/${env}`);

    const content = variables
      .map((v: any) => `${v.key}=${v.value || ''}`)
      .join('\n');

    fs.writeFileSync('.env', content + '\n');

    spinner.succeed(chalk.green(`${variables.length} variables downloaded to .env`));
  } catch (error: any) {
    spinner.fail(chalk.red(error.response?.data?.error || 'Failed to pull'));
    process.exit(1);
  }
}
