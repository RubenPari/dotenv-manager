/**
 * Spinner wrapper
 * @module cli/utils/withSpinner
 * @description Wraps async CLI actions with a uniform spinner + error handler.
 */
import ora from 'ora';
import type { Ora } from 'ora';
import chalk from 'chalk';
import { getErrorMessage } from './errors';

/**
 * Run an async action inside an ora spinner.
 * On error, the spinner shows a failure message and the process exits with code 1.
 * @param text - Initial spinner text.
 * @param action - Function that receives the spinner instance.
 */
export async function withSpinner<T>(
  text: string,
  action: (spinner: Ora) => Promise<T>,
): Promise<T> {
  const spinner = ora(text).start();
  try {
    return await action(spinner);
  } catch (error: unknown) {
    spinner.fail(chalk.red(getErrorMessage(error, 'Command failed')));
    process.exit(1);
  }
}
