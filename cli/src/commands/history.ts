import chalk from 'chalk';
import ora from 'ora';
import { getApiClient, getProjectIdBySlug } from '../api/client';
import { readLocalConfig } from '../config';

export async function historyAction(opts: { limit?: string }): Promise<void> {
  const localConfig = readLocalConfig();
  if (!localConfig) {
    console.log(chalk.red('Not initialized. Run `dm init` first.'));
    process.exit(1);
  }

  const spinner = ora('Loading history...').start();
  const limit = parseInt(opts.limit || '20');

  try {
    const api = getApiClient();
    const projectId = await getProjectIdBySlug(localConfig.projectSlug);
    const { data: logs } = await api.get(
      `/api/v1/projects/${projectId}/envs/dev/history`,
      { params: { limit } }
    );

    spinner.stop();
    if (logs.length === 0) {
      console.log(chalk.yellow('No changes recorded.'));
      return;
    }

    console.log(chalk.bold('\nRecent changes:\n'));
    for (const log of logs) {
      const action = log.action === 'CREATE' ? chalk.green('+') :
                     log.action === 'DELETE' ? chalk.red('-') :
                     chalk.yellow('~');
      const date = new Date(log.createdAt).toLocaleString();
      console.log(`  ${action} ${date.padEnd(25)} ${log.key}`);
    }
    console.log();
  } catch (error: any) {
    spinner.fail(chalk.red(error.response?.data?.error || 'Failed to load history'));
    process.exit(1);
  }
}
