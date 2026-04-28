/**
 * Diff command
 * @module cli/commands/diff
 * @description Compares two environments and prints a colorized diff.
 */
import chalk from 'chalk';
import { getApiClient, getProjectIdBySlug } from '../api/client';
import { requireLocalConfig } from '../utils/requireLocalConfig';
import { withSpinner } from '../utils/withSpinner';
import type { DiffEntry } from '@rubenpari/dotenv-cli-shared';

/**
 * `dm diff <env1> <env2>` action.
 * @param env1 - First environment name.
 * @param env2 - Second environment name.
 */
export async function diffAction(env1: string, env2: string): Promise<void> {
  const localConfig = requireLocalConfig();

  await withSpinner('Comparing environments...', async (spinner) => {
    const api = getApiClient();
    const projectId = await getProjectIdBySlug(localConfig.projectSlug);
    const { data: diff } = await api.get<DiffEntry[]>(
      `/api/v1/projects/${projectId}/envs/${env1}/diff/${env2}`,
    );

    spinner.stop();
    console.log(chalk.bold(`\nDiff: ${env1} vs ${env2}\n`));

    const keyWidth = 25;
    const valWidth = 35;

    console.log(
      chalk.gray('KEY'.padEnd(keyWidth) + env1.toUpperCase().padEnd(valWidth) + env2.toUpperCase()),
    );
    console.log('  ' + '-'.repeat(keyWidth + valWidth * 2));

    for (const d of diff) {
      const key = d.key.padEnd(keyWidth);
      const v1 =
        d.status === 'removed'
          ? chalk.red((d.env1 || '[missing]').padEnd(valWidth))
          : d.status === 'modified'
            ? chalk.yellow((d.env1 || '[secret]').padEnd(valWidth))
            : (d.env1 || '[secret]').padEnd(valWidth);

      const v2 =
        d.status === 'added'
          ? chalk.green((d.env2 || '[missing]').padEnd(valWidth))
          : d.status === 'modified'
            ? chalk.yellow((d.env2 || '[secret]').padEnd(valWidth))
            : d.env2 || '[secret]';

      console.log(`  ${key}${v1}${v2}`);
    }
    console.log();
  });
}
