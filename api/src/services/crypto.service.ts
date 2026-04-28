/**
 * Variable encryption
 * @module api/services/crypto.service
 * @description Encrypts/decrypts secret variable values for storage.
 */
import crypto from 'crypto';
import { getConfig } from '../config';
import { logger } from '../utils/logger';

const config = getConfig();

const PBKDF2_ITERATIONS = 310_000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = 'sha256';

interface EncryptedPayload {
  iv: string;
  ciphertext: string;
  authTag: string;
}

/**
 * Encrypt a variable value using AES-256-GCM.
 * @param value - The plaintext value to encrypt.
 * @returns A JSON string payload containing IV, ciphertext and auth tag.
 */
export function encryptVariable(value: string): string {
  const iv = crypto.randomBytes(12);
  const key = deriveKey();

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const payload: EncryptedPayload = {
    iv: iv.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
    authTag: authTag.toString('base64'),
  };

  return JSON.stringify(payload);
}

/**
 * Decrypt an encrypted variable payload created by `encryptVariable`.
 * @param encrypted - The encrypted JSON payload.
 * @returns The decrypted plaintext value.
 */
export function decryptVariable(encrypted: string): string {
  const payload: EncryptedPayload = JSON.parse(encrypted);
  const key = deriveKey();

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, 'base64')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Derive an encryption key from `MASTER_KEY_PEPPER` and `MASTER_KEY_SALT`.
 * In production both must be set. In dev/test, fallbacks are used with a warning.
 * @returns A 32-byte key buffer suitable for AES-256-GCM.
 */
function deriveKey(): Buffer {
  if (!config.MASTER_KEY_PEPPER && config.NODE_ENV === 'production') {
    throw new Error('MASTER_KEY_PEPPER is required in production');
  }

  const pepper = config.MASTER_KEY_PEPPER || generateDevPepper();
  const salt = config.MASTER_KEY_SALT || 'dotenv-manager-salt';

  if (!config.MASTER_KEY_PEPPER && config.NODE_ENV !== 'production') {
    logger.warn('MASTER_KEY_PEPPER is not set; using a random dev-only pepper. Secrets will not persist across restarts.');
  }

  return crypto.pbkdf2Sync(pepper, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST);
}

/**
 * Generate a random pepper for dev/test environments.
 * This ensures each process restart uses a different key, making it
 * obvious that dev secrets are not portable.
 */
function generateDevPepper(): string {
  return crypto.randomBytes(16).toString('hex');
}
