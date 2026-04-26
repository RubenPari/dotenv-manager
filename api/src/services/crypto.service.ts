import crypto from 'crypto';
import { getConfig } from '../config';

const config = getConfig();

interface EncryptedPayload {
  iv: string;
  ciphertext: string;
  authTag: string;
}

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

function deriveKey(): Buffer {
  if (!config.MASTER_KEY_PEPPER) {
    if (config.NODE_ENV === 'production') {
      throw new Error('MASTER_KEY_PEPPER is required in production');
    }
  }

  const pepper = config.MASTER_KEY_PEPPER || 'dev-only-pepper';
  return crypto.pbkdf2Sync(pepper, 'dotenv-manager-salt', 310000, 32, 'sha256');
}
