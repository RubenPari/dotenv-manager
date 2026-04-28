/**
 * Login command
 * @module cli/commands/login
 * @description Authenticates the user and stores an access token in CLI credentials.
 */
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getPublicClient } from '../api/client';
import { writeCredentials } from '../config';
import { withSpinner } from '../utils/withSpinner';
import type { LoginResponse } from '@rubenpari/dotenv-cli-shared';

/**
 * `dm login` action.
 */
export async function loginAction(): Promise<void> {
  const { email, password } = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Email:',
      validate: (v: string) => v.includes('@') || 'Invalid email',
    },
    { type: 'password', name: 'password', message: 'Password:', mask: '*' },
  ]);

  await withSpinner('Authenticating...', async (spinner) => {
    const client = getPublicClient();
    const { data } = await client.post<LoginResponse>('/api/v1/auth/login', { email, password });

    writeCredentials({
      apiUrl: client.defaults.baseURL as string,
      accessToken: data.accessToken,
    });

    spinner.succeed(chalk.green(`Authenticated as ${email}`));
  });
}
