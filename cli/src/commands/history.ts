/**
 * History command
 * @module cli/commands/history
 * @description Displays recent audit log entries for the active project/environment.
 */
import chalk from 'chalk';
import ora from 'ora';
import { getApiClient, getProjectIdBySlug } from '../api/client';
import { requireLocalConfig } from '../utils/requireLocalConfig';
import { getErrorMessage } from '../utils/errors';

type AuditLog = { action: string; key: string; createdAt: string };

/**
 * `dm history` action.
 * @param opts - Options provided by commander.
 */
export async function historyAction(opts: { limit?: string }): Promise<void> {
  const localConfig = requireLocalConfig();

  const spinner = ora('Loading history...').start();
  const limit = parseInt(opts.limit || '20');

  try {
    const api = getApiClient();
    const projectId = await getProjectIdBySlug(localConfig.projectSlug);
    const { data: logs } = await api.get<AuditLog[]>(
      `/api/v1/projects/${projectId}/envs/dev/history`,
      { params: { limit } },
    );

    spinner.stop();
    if (logs.length === 0) {
      console.log(chalk.yellow('No changes recorded.'));
      return;
    }

    console.log(chalk.bold('\nRecent changes:\n'));
    for (const log of logs) {
      const action =
        log.action === 'CREATE'
          ? chalk.green('+')
          : log.action === 'DELETE'
            ? chalk.red('-')
            : chalk.yellow('~');
      const date = new Date(log.createdAt).toLocaleString();
      console.log(`  ${action} ${date.padEnd(25)} ${log.key}`);
    }
    console.log();
  } catch (error: unknown) {
    spinner.fail(chalk.red(getErrorMessage(error, 'Failed to load history')));
    process.exit(1);
  }
}
