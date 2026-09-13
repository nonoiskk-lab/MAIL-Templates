import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

/**
 * Symmetric encryption for OAuth tokens at rest (AES-256-GCM).
 * Server-only: never import this file from a client component.
 *
 * TOKEN_ENCRYPTION_KEY must be a 32+ character secret set in the server
 * environment. It is derived into a 256-bit key with scrypt so any
 * passphrase length works safely.
 */

function getKey(): Buffer {
  const secret = process.env.TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY is not set. Required to store OAuth tokens securely.",
    );
  }
  return scryptSync(secret, "mailcraft-ai-token-salt", 32);
}

export function encryptToken(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(".");
}

export function decryptToken(payload: string): string {
  const key = getKey();
  const [ivB64, authTagB64, dataB64] = payload.split(".");
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error("Malformed encrypted token payload.");
  }
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}
