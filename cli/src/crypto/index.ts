import crypto from 'crypto';

interface EncryptedPayload {
  iv: string;
  ciphertext: string;
  authTag: string;
}

export function encryptValue(value: string, key: string): string {
  const iv = crypto.randomBytes(12);
  const derivedKey = deriveKey(key);

  const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const payload: EncryptedPayload = {
    iv: iv.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
    authTag: authTag.toString('base64'),
  };

  return JSON.stringify(payload);
}

export function decryptValue(encrypted: string, key: string): string {
  const payload: EncryptedPayload = JSON.parse(encrypted);
  const derivedKey = deriveKey(key);

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    derivedKey,
    Buffer.from(payload.iv, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, 'base64')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

function deriveKey(password: string): Buffer {
  return crypto.pbkdf2Sync(password, 'dotenv-manager-local', 310000, 32, 'sha256');
}
