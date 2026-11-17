const ALPHANUMERIC = "0123456789abcdefghijklmnopqrstuvwxyz";

/** Generate a cryptographically random alphanumeric suffix using Web Crypto. */
export function randomIdSuffix(length: number = 6): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC[bytes[i] % ALPHANUMERIC.length];
  }
  return result;
}
