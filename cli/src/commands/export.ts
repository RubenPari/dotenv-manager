import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { getApiClient, getProjectIdBySlug } from '../api/client';
import { readLocalConfig } from '../config';

export async function exportAction(opts: { format?: string; output?: string }): Promise<void> {
  const localConfig = readLocalConfig();
  if (!localConfig) {
    console.log(chalk.red('Not initialized. Run `dm init` first.'));
    process.exit(1);
  }

  const spinner = ora('Exporting variables...').start();
  const format = opts.format || 'env';

  try {
    const api = getApiClient();
    const projectId = await getProjectIdBySlug(localConfig.projectSlug);
    const { data } = await api.get(
      `/api/v1/projects/${projectId}/envs/dev/export`,
      { params: { format } }
    );

    if (opts.output) {
      fs.writeFileSync(opts.output, data);
      spinner.succeed(chalk.green(`Exported to ${opts.output}`));
    } else {
      spinner.stop();
      console.log(data);
    }
  } catch (error: any) {
    spinner.fail(chalk.red(error.response?.data?.error || 'Failed to export'));
    process.exit(1);
  }
}
