import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { getApiClient, getProjectIdBySlug } from '../api/client';
import { getActiveEnv } from '../config';
import { requireLocalConfig } from '../utils/requireLocalConfig';
import { getErrorMessage } from '../utils/errors';
import { parseDotenv, type VariableInput, type VariableResponse } from '@dotenv-manager/shared';

export async function pushAction(opts: { env?: string }): Promise<void> {
  const localConfig = requireLocalConfig();

  const envFile = '.env';
  if (!fs.existsSync(envFile)) {
    console.log(chalk.red('.env file not found'));
    process.exit(1);
  }

  const spinner = ora('Syncing to backend...').start();
  const env = getActiveEnv(localConfig, opts.env);

  try {
    const envConfig = parseDotenv(fs.readFileSync(envFile, 'utf-8'));
    const projectId = await getProjectIdBySlug(localConfig.projectSlug);

    const variables: VariableInput[] = Object.entries(envConfig).map(([key, value]) => ({
      key,
      value,
      isSecret: false,
      isRequired: false,
      description: '',
    }));

    const api = getApiClient();
    await api.put(`/api/v1/projects/${projectId}/envs/${env}`, variables);

    const secrets = variables.filter((v) => v.isSecret).length;
    spinner.succeed(
      chalk.green(`${variables.length} variables synchronized (${secrets} encrypted)`),
    );
  } catch (error: unknown) {
    spinner.fail(chalk.red(getErrorMessage(error, 'Failed to sync')));
    process.exit(1);
  }
}

export async function pullAction(opts: { env?: string }): Promise<void> {
  const localConfig = requireLocalConfig();

  const spinner = ora('Downloading variables...').start();
  const env = getActiveEnv(localConfig, opts.env);

  try {
    const api = getApiClient();
    const projectId = await getProjectIdBySlug(localConfig.projectSlug);
    const { data: variables } = await api.get<VariableResponse[]>(
      `/api/v1/projects/${projectId}/envs/${env}`,
    );

    const content = variables.map((v) => `${v.key}=${v.value || ''}`).join('\n');

    fs.writeFileSync('.env', content + '\n');

    spinner.succeed(chalk.green(`${variables.length} variables downloaded to .env`));
  } catch (error: unknown) {
    spinner.fail(chalk.red(getErrorMessage(error, 'Failed to pull')));
    process.exit(1);
  }
}
