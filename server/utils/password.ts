import crypto from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);
const SALT_BYTES = 16;
const KEY_LENGTH = 64;
const SCRYPT_PREFIX = "scrypt";

/** Hash a password using scrypt with a random 16-byte salt. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${SCRYPT_PREFIX}:${salt}:${derivedKey.toString("hex")}`;
}

/** Verify a plaintext password against a stored scrypt hash. */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const parts = storedHash.split(":");
  if (parts.length !== 3 || parts[0] !== SCRYPT_PREFIX) {
    return false;
  }

  const [, salt, expectedHex] = parts;
  if (!salt || !expectedHex) {
    return false;
  }

  const expectedBuf = Buffer.from(expectedHex, "hex");
  const derivedKey = (await scryptAsync(password, salt, expectedBuf.length)) as Buffer;

  if (derivedKey.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(derivedKey, expectedBuf);
}
