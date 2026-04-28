/**
 * History command
 * @module cli/commands/history
 * @description Shows recent audit log entries for the current project.
 */
import chalk from 'chalk';
import { getApiClient, getProjectIdBySlug } from '../api/client';
import { requireLocalConfig } from '../utils/requireLocalConfig';
import { withSpinner } from '../utils/withSpinner';

type AuditLog = { action: string; key: string; createdAt: string };

/**
 * `dm history` action.
 * @param opts - Options provided by commander.
 */
export async function historyAction(opts: { limit?: string }): Promise<void> {
  const localConfig = requireLocalConfig();
  const limit = parseInt(opts.limit || '20', 10);

  await withSpinner('Loading history...', async (spinner) => {
    const api = getApiClient();
    const projectId = await getProjectIdBySlug(localConfig.projectSlug);
    const { data: logs } = await api.get<AuditLog[]>(
      `/api/v1/projects/${projectId}/envs/dev/history`,
      { params: { limit: String(limit) } },
    );

    spinner.stop();
    if (logs.length === 0) {
      console.log(chalk.yellow('No history found.'));
      return;
    }

    console.log(chalk.bold(`\nHistory (last ${logs.length}):\n`));
    for (const log of logs) {
      console.log(`  ${chalk.gray(log.createdAt)}  ${log.action}  ${log.key}`);
    }
    console.log();
  });
}
