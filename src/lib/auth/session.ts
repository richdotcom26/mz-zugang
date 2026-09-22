import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Sitzungs-Cookie: signiertes "<expiryMs>.<hmac>" — kein Login-System,
 * nur ein geteiltes Portal-Passwort. Kein Payload nötig, nur die
 * Signatur beweist, dass das Cookie von uns gesetzt wurde.
 */
export const SESSION_COOKIE = "gz_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 Tage

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET fehlt (siehe .env.example)");
  return s;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function createSessionValue(): { value: string; maxAge: number } {
  const expiry = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expiry);
  const value = `${payload}.${sign(payload)}`;
  return { value, maxAge: MAX_AGE_SECONDS };
}

export function isValidSession(value: string | undefined): boolean {
  if (!value) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const expiry = Number(payload);
  return Number.isFinite(expiry) && expiry > Date.now();
}
