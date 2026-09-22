import { randomBytes, scryptSync } from "node:crypto";

// Eigenständige Kopie der Hash-Logik (kein "server-only"-Import in Node-Skripten).
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const password = process.argv[2];
if (!password) {
  console.error("Verwendung: npm run hash-password -- <passwort>");
  process.exit(1);
}

console.log(hashPassword(password));
