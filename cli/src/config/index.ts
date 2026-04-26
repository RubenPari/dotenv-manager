/**
 * CLI configuration storage
 * @module cli/config/index
 * @description Reads/writes global credentials and per-project local config for the CLI.
 */
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface CliConfig {
  apiUrl: string;
  accessToken?: string;
  projectSlug?: string;
  env?: string;
}

export interface LocalConfig {
  projectSlug: string;
  env?: string;
}

export const CONFIG_DIR = path.join(os.homedir(), '.dotenv-manager');
export const CREDENTIALS_FILE = path.join(CONFIG_DIR, 'credentials.json');
export const LOCAL_CONFIG_FILE = '.dm-config.json';

/**
 * Ensure the global CLI config directory exists with restricted permissions.
 */
export function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

/**
 * Read persisted global credentials (if any).
 * Falls back to `DM_API_URL` or localhost in absence of saved credentials.
 */
export function readCredentials(): CliConfig {
  try {
    const data = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { apiUrl: process.env.DM_API_URL || 'http://localhost:3000' };
  }
}

/**
 * Persist global credentials (API URL, access token, defaults).
 */
export function writeCredentials(config: CliConfig): void {
  ensureConfigDir();
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

/**
 * Read local project config from the current working directory.
 */
export function readLocalConfig(): LocalConfig | null {
  try {
    const data = fs.readFileSync(LOCAL_CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Persist local project config to the current working directory.
 */
export function writeLocalConfig(config: LocalConfig): void {
  fs.writeFileSync(LOCAL_CONFIG_FILE, JSON.stringify(config, null, 2));
}

/**
 * Determine active environment based on an explicit flag or local config.
 * @param localConfig - Local config (if present).
 * @param flag - Optional CLI flag override.
 * @returns The active environment name (defaults to `dev`).
 */
export function getActiveEnv(localConfig: LocalConfig | null, flag?: string): string {
  return flag || localConfig?.env || 'dev';
}
