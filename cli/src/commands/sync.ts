/**
 * Sync commands
 * @module cli/commands/sync
 * @description Push/pull `.env` variables between local files and the backend API.
 */
import fs from 'fs';
import chalk from 'chalk';
import { getApiClient, getProjectIdBySlug } from '../api/client';
import { getActiveEnv } from '../config';
import { requireLocalConfig } from '../utils/requireLocalConfig';
import { withSpinner } from '../utils/withSpinner';
import {
  parseDotenv,
  type VariableInput,
  type VariableResponse,
} from '@rubenpari/dotenv-cli-shared';

/**
 * `dm push` action.
 * Reads local `.env` file and upserts variables on the backend.
 */
export async function pushAction(opts: { env?: string }): Promise<void> {
  const localConfig = requireLocalConfig();

  const envFile = '.env';
  if (!fs.existsSync(envFile)) {
    console.log(chalk.red('.env file not found'));
    process.exit(1);
  }

  const env = getActiveEnv(localConfig, opts.env);
  const envConfig = parseDotenv(fs.readFileSync(envFile, 'utf-8'));

  await withSpinner('Syncing to backend...', async (spinner) => {
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
    spinner.succeed(chalk.green(`${variables.length} variables synchronized (${secrets} encrypted)`));
  });
}

/**
 * `dm pull` action.
 * Downloads variables from the backend and writes a local `.env` file.
 */
export async function pullAction(opts: { env?: string }): Promise<void> {
  const localConfig = requireLocalConfig();
  const env = getActiveEnv(localConfig, opts.env);

  await withSpinner('Downloading variables...', async (spinner) => {
    const api = getApiClient();
    const projectId = await getProjectIdBySlug(localConfig.projectSlug);
    const { data: variables } = await api.get<VariableResponse[]>(
      `/api/v1/projects/${projectId}/envs/${env}`,
    );

    const content = variables.map((v) => `${v.key}=${v.value || ''}`).join('\n');
    fs.writeFileSync('.env', content + '\n');

    spinner.succeed(chalk.green(`${variables.length} variables downloaded to .env`));
  });
}
