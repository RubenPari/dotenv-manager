import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { getPublicClient } from '../api/client';
import { writeCredentials } from '../config';
import { getErrorMessage } from '../utils/errors';
import type { LoginResponse } from '@dotenv-manager/shared';

export async function loginAction(): Promise<void> {
  const { email, password } = await inquirer.prompt([
    { type: 'input', name: 'email', message: 'Email:', validate: (v: string) => v.includes('@') || 'Invalid email' },
    { type: 'password', name: 'password', message: 'Password:', mask: '*' },
  ]);

  const spinner = ora('Authenticating...').start();

  try {
    const client = getPublicClient();
    const { data } = await client.post<LoginResponse>('/api/v1/auth/login', { email, password });

    writeCredentials({
      apiUrl: client.defaults.baseURL as string,
      accessToken: data.accessToken,
    });

    spinner.succeed(chalk.green(`Authenticated as ${email}`));
  } catch (error: unknown) {
    spinner.fail(chalk.red(getErrorMessage(error, 'Authentication failed')));
    process.exit(1);
  }
}
