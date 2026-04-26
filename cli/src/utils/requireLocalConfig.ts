import chalk from 'chalk';
import { readLocalConfig, type LocalConfig } from '../config';

export function requireLocalConfig(): LocalConfig {
  const localConfig = readLocalConfig();
  if (!localConfig) {
    console.log(chalk.red('Not initialized. Run `dm init` first.'));
    process.exit(1);
  }
  return localConfig;
}

