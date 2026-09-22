import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Gemeinsames Portal-Passwort: als Hash in PORTAL_PASSWORD_HASH abgelegt
 * (Format "salt:hash", beides hex), nie im Klartext gespeichert.
 * Erzeugen mit `npm run hash-password`.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
