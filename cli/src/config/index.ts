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

export function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

export function readCredentials(): CliConfig {
  try {
    const data = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { apiUrl: process.env.DM_API_URL || 'http://localhost:3000' };
  }
}

export function writeCredentials(config: CliConfig): void {
  ensureConfigDir();
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

export function readLocalConfig(): LocalConfig | null {
  try {
    const data = fs.readFileSync(LOCAL_CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function writeLocalConfig(config: LocalConfig): void {
  fs.writeFileSync(LOCAL_CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getActiveEnv(localConfig: LocalConfig | null, flag?: string): string {
  return flag || localConfig?.env || 'dev';
}
