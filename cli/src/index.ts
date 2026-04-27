#!/usr/bin/env node

/**
 * CLI entrypoint
 * @module cli/index
 * @description Registers all CLI commands and parses argv.
 */
import { Command } from 'commander';
import { loginAction } from './commands/login';
import { initAction } from './commands/init';
import { envListAction, envUseAction } from './commands/env';
import { varAddAction, varGetAction, varListAction } from './commands/var';
import { pushAction, pullAction } from './commands/sync';
import { diffAction } from './commands/diff';
import { exportAction } from './commands/export';
import { importAction } from './commands/import';
import { historyAction } from './commands/history';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json') as { version: string };

const program = new Command();

program.name('dm').description('Dotenv Manager CLI').version(version);

program.command('login').description('Authenticate with Dotenv Manager').action(loginAction);

program
  .command('init')
  .description('Initialize project in current directory')
  .option('-p, --project <slug>', 'Project slug')
  .action(initAction);

const envCmd = program.command('env').description('Manage environments');
envCmd.command('list').description('List available environments').action(envListAction);
envCmd.command('use <name>').description('Set active environment').action(envUseAction);

const varCmd = program.command('var').description('Manage variables');
varCmd.command('add <KEY>').description('Add or update a variable').action(varAddAction);
varCmd.command('get <KEY>').description('Get a variable value').action(varGetAction);
varCmd
  .command('list')
  .description('List all variables')
  .option('-e, --env <name>', 'Environment name')
  .action(varListAction);

program
  .command('push')
  .description('Sync local .env to backend')
  .option('-e, --env <name>', 'Environment name')
  .action(pushAction);

program
  .command('pull')
  .description('Download variables from backend')
  .option('-e, --env <name>', 'Environment name')
  .action(pullAction);

program.command('diff <env1> <env2>').description('Compare two environments').action(diffAction);

program
  .command('export')
  .description('Export variables to file or stdout')
  .option('-f, --format <format>', 'Output format (env, json, shell)', 'env')
  .option('-o, --output <file>', 'Output file')
  .action(exportAction);

program
  .command('import <file>')
  .description('Import variables from .env file')
  .action(importAction);

program
  .command('history')
  .description('Show recent changes')
  .option('-l, --limit <number>', 'Number of entries', '20')
  .action(historyAction);

program.parse();
