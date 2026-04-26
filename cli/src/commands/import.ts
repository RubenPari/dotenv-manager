/**
 * Import command
 * @module cli/commands/import
 * @description Imports variables from a dotenv file and sends them to the backend.
 */
import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { getApiClient, getProjectIdBySlug } from '../api/client';
import { requireLocalConfig } from '../utils/requireLocalConfig';
import { getErrorMessage } from '../utils/errors';

/**
 * `dm import <file>` action.
 * @param file - Path to a dotenv file.
 */
export async function importAction(file: string): Promise<void> {
  const localConfig = requireLocalConfig();

  if (!fs.existsSync(file)) {
    console.log(chalk.red(`File not found: ${file}`));
    process.exit(1);
  }

  const spinner = ora('Importing variables...').start();
  const content = fs.readFileSync(file, 'utf-8');

  try {
    const api = getApiClient();
    const projectId = await getProjectIdBySlug(localConfig.projectSlug);
    const { data } = await api.post(`/api/v1/projects/${projectId}/envs/dev/import`, { content });

    spinner.succeed(chalk.green(`${data.imported} variables imported`));
  } catch (error: unknown) {
    spinner.fail(chalk.red(getErrorMessage(error, 'Failed to import')));
    process.exit(1);
  }
}
