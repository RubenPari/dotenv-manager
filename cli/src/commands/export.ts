/**
 * Export command
 * @module cli/commands/export
 * @description Exports variables from an environment to stdout or a file.
 */
import fs from 'fs';
import chalk from 'chalk';
import { getApiClient, getProjectIdBySlug } from '../api/client';
import { getActiveEnv } from '../config';
import { requireLocalConfig } from '../utils/requireLocalConfig';
import { withSpinner } from '../utils/withSpinner';

/**
 * `dm export` action.
 * @param opts - Options provided by commander.
 */
export async function exportAction(opts: {
  format?: string;
  output?: string;
}): Promise<void> {
  const localConfig = requireLocalConfig();
  const format = opts.format || 'env';
  const env = getActiveEnv(localConfig);

  await withSpinner('Exporting variables...', async (spinner) => {
    const api = getApiClient();
    const projectId = await getProjectIdBySlug(localConfig.projectSlug);
    const { data } = await api.get(`/api/v1/projects/${projectId}/envs/${env}/export`, {
      params: { format },
    });

    if (opts.output) {
      fs.writeFileSync(opts.output, data);
      spinner.succeed(chalk.green(`Exported to ${opts.output}`));
    } else {
      spinner.stop();
      console.log(data);
    }
  });
}
