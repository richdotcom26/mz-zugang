import "server-only";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { DomainError } from "./errors";

export async function listAdmins() {
  return db.select().from(schema.admins).orderBy(asc(schema.admins.name));
}

export async function createAdmin(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new DomainError("VALIDATION", "Bitte einen Namen angeben.", { name: ["Pflichtfeld"] });
  }

  try {
    const [admin] = await db.insert(schema.admins).values({ name: trimmed }).returning();
    return admin;
  } catch (e) {
    if (isUniqueViolation(e)) {
      throw new DomainError("CONFLICT", `"${trimmed}" gibt es schon.`, { name: ["bereits vorhanden"] });
    }
    throw e;
  }
}

export async function updateAdmin(id: number, name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new DomainError("VALIDATION", "Bitte einen Namen angeben.", { name: ["Pflichtfeld"] });
  }

  try {
    const [admin] = await db
      .update(schema.admins)
      .set({ name: trimmed })
      .where(eq(schema.admins.id, id))
      .returning();
    if (!admin) throw new DomainError("NOT_FOUND", "Nicht gefunden.");
    return admin;
  } catch (e) {
    if (isUniqueViolation(e)) {
      throw new DomainError("CONFLICT", `"${trimmed}" gibt es schon.`, { name: ["bereits vorhanden"] });
    }
    throw e;
  }
}

function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "23505";
}
