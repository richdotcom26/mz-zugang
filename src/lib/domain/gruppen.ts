import "server-only";
import { asc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { DomainError } from "./errors";

export async function listGruppen() {
  return db.select().from(schema.gruppen).orderBy(asc(schema.gruppen.position), asc(schema.gruppen.id));
}

export async function createGruppe(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new DomainError("VALIDATION", "Bitte einen Gruppennamen angeben.", { name: ["Pflichtfeld"] });
  }

  try {
    const [gruppe] = await db
      .insert(schema.gruppen)
      .values({
        name: trimmed,
        position: sql`coalesce((select max(${schema.gruppen.position}) + 1 from ${schema.gruppen}), 0)`,
      })
      .returning();
    return gruppe;
  } catch (e) {
    if (isUniqueViolation(e)) {
      throw new DomainError("CONFLICT", `Gruppe "${trimmed}" gibt es schon.`, { name: ["bereits vorhanden"] });
    }
    throw e;
  }
}

export async function updateGruppe(id: number, name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new DomainError("VALIDATION", "Bitte einen Gruppennamen angeben.", { name: ["Pflichtfeld"] });
  }

  try {
    const [gruppe] = await db
      .update(schema.gruppen)
      .set({ name: trimmed })
      .where(eq(schema.gruppen.id, id))
      .returning();
    if (!gruppe) throw new DomainError("NOT_FOUND", "Gruppe nicht gefunden.");
    return gruppe;
  } catch (e) {
    if (isUniqueViolation(e)) {
      throw new DomainError("CONFLICT", `Gruppe "${trimmed}" gibt es schon.`, { name: ["bereits vorhanden"] });
    }
    throw e;
  }
}

export async function moveGruppe(id: number, richtung: "up" | "down") {
  const alle = await listGruppen();
  const idx = alle.findIndex((g) => g.id === id);
  if (idx === -1) throw new DomainError("NOT_FOUND", "Gruppe nicht gefunden.");

  const nachbarIdx = richtung === "up" ? idx - 1 : idx + 1;
  if (nachbarIdx < 0 || nachbarIdx >= alle.length) return;

  const a = alle[idx];
  const b = alle[nachbarIdx];
  await db.transaction(async (tx) => {
    await tx.update(schema.gruppen).set({ position: b.position }).where(eq(schema.gruppen.id, a.id));
    await tx.update(schema.gruppen).set({ position: a.position }).where(eq(schema.gruppen.id, b.id));
  });
}

function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "23505";
}
