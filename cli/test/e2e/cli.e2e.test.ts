import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from '@jest/globals';

function runCli(args: string[], opts: { cwd: string; home: string }) {
  const cliRoot = path.resolve(__dirname, '../..');
  const entry = path.join(cliRoot, 'src/index.ts');

  const result = spawnSync('npx', ['-y', 'tsx', entry, ...args], {
    cwd: opts.cwd,
    env: { ...process.env, HOME: opts.home },
    encoding: 'utf-8',
  });
  return result;
}

describe('cli e2e', () => {
  it('prints help', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dm-cli-e2e-'));
    const res = runCli(['--help'], { cwd: tmp, home: tmp });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('Dotenv Manager CLI');
  });

  it('env use writes local config', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dm-cli-e2e-'));
    const cwd = tmp;

    fs.writeFileSync(path.join(cwd, '.dm-config.json'), JSON.stringify({ projectSlug: 'demo' }, null, 2));

    const res = runCli(['env', 'use', 'staging'], { cwd, home: tmp });
    expect(res.status).toBe(0);

    const config = JSON.parse(fs.readFileSync(path.join(cwd, '.dm-config.json'), 'utf-8'));
    expect(config).toMatchObject({ projectSlug: 'demo', env: 'staging' });
  });
});

