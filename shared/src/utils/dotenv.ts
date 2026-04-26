/**
 * Dotenv parsing/types
 * @module shared/utils/dotenv
 * @description Shared helpers and types for working with `.env`-style key/value files.
 */
export type DotenvKeyValues = Record<string, string>;

/**
 * Parse .env file content into key/value pairs.
 * - Ignores blank lines and comments starting with '#'
 * - Supports values containing '='
 * - Unquotes simple single/double-quoted values
 */
export function parseDotenv(content: string): DotenvKeyValues {
  const out: DotenvKeyValues = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const [rawKey, ...rest] = trimmed.split('=');
    const key = rawKey?.trim();
    if (!key) continue;

    const rawValue = rest.join('=');
    const value = rawValue.replace(/^["']|["']$/g, '');
    out[key] = value;
  }

  return out;
}

/**
 * A normalized variable entry used across packages (CLI/API/web).
 */
export interface DotenvVariableEntry {
  key: string;
  value: string;
  isSecret: boolean;
  isRequired: boolean;
  description?: string;
}
