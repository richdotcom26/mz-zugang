import "server-only";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { DomainError } from "./errors";

export async function listRaeume() {
  return db.select().from(schema.raeume).orderBy(asc(schema.raeume.name));
}

export async function createRaum(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new DomainError("VALIDATION", "Bitte einen Raumnamen angeben.", { name: ["Pflichtfeld"] });
  }

  try {
    const [raum] = await db.insert(schema.raeume).values({ name: trimmed }).returning();
    return raum;
  } catch (e) {
    if (isUniqueViolation(e)) {
      throw new DomainError("CONFLICT", `Raum "${trimmed}" gibt es schon.`, { name: ["bereits vorhanden"] });
    }
    throw e;
  }
}

export async function updateRaum(id: number, name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new DomainError("VALIDATION", "Bitte einen Raumnamen angeben.", { name: ["Pflichtfeld"] });
  }

  try {
    const [raum] = await db
      .update(schema.raeume)
      .set({ name: trimmed })
      .where(eq(schema.raeume.id, id))
      .returning();
    if (!raum) throw new DomainError("NOT_FOUND", "Raum nicht gefunden.");
    return raum;
  } catch (e) {
    if (isUniqueViolation(e)) {
      throw new DomainError("CONFLICT", `Raum "${trimmed}" gibt es schon.`, { name: ["bereits vorhanden"] });
    }
    throw e;
  }
}

function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "23505";
}
