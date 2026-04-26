import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { getApiClient, getProjectIdBySlug } from '../api/client';
import { readLocalConfig } from '../config';

export async function importAction(file: string): Promise<void> {
  const localConfig = readLocalConfig();
  if (!localConfig) {
    console.log(chalk.red('Not initialized. Run `dm init` first.'));
    process.exit(1);
  }

  if (!fs.existsSync(file)) {
    console.log(chalk.red(`File not found: ${file}`));
    process.exit(1);
  }

  const spinner = ora('Importing variables...').start();
  const content = fs.readFileSync(file, 'utf-8');

  try {
    const api = getApiClient();
    const projectId = await getProjectIdBySlug(localConfig.projectSlug);
    const { data } = await api.post(
      `/api/v1/projects/${projectId}/envs/dev/import`,
      { content }
    );

    spinner.succeed(chalk.green(`${data.imported} variables imported`));
  } catch (error: any) {
    spinner.fail(chalk.red(error.response?.data?.error || 'Failed to import'));
    process.exit(1);
  }
}
