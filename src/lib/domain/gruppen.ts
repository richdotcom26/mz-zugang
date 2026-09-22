import "server-only";
import { asc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { DomainError } from "./errors";

export async function listGruppen() {
  return db.select().from(schema.gruppen).orderBy(asc(schema.gruppen.name));
}

export async function createGruppe(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new DomainError("VALIDATION", "Bitte einen Gruppennamen angeben.", { name: ["Pflichtfeld"] });
  }

  try {
    const [gruppe] = await db.insert(schema.gruppen).values({ name: trimmed }).returning();
    return gruppe;
  } catch (e) {
    if (isUniqueViolation(e)) {
      throw new DomainError("CONFLICT", `Gruppe "${trimmed}" gibt es schon.`, { name: ["bereits vorhanden"] });
    }
    throw e;
  }
}

function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "23505";
}
