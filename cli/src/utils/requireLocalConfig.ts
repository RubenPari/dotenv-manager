/**
 * Local config guard
 * @module cli/utils/requireLocalConfig
 * @description Ensures the CLI is initialized in the current directory.
 */
import chalk from 'chalk';
import { readLocalConfig, type LocalConfig } from '../config';

/**
 * Read local config or exit with a helpful message.
 * @returns The local config for the current directory.
 */
export function requireLocalConfig(): LocalConfig {
  const localConfig = readLocalConfig();
  if (!localConfig) {
    console.log(chalk.red('Not initialized. Run `dm init` first.'));
    process.exit(1);
  }
  return localConfig;
}
