import "server-only";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { DomainError } from "./errors";

export const personSchema = z.object({
  vorname: z.string().trim().min(1, "Pflichtfeld"),
  nachname: z.string().trim().min(1, "Pflichtfeld"),
  gruppeId: z.coerce.number().int().positive("Bitte eine Gruppe wählen"),
  transponderNr: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
  bemerkung: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
  eingetragenVon: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type PersonInput = z.infer<typeof personSchema>;

export async function listPersonenMitGruppe() {
  return db
    .select({
      id: schema.personen.id,
      vorname: schema.personen.vorname,
      nachname: schema.personen.nachname,
      transponderNr: schema.personen.transponderNr,
      bemerkung: schema.personen.bemerkung,
      eingetragenVon: schema.personen.eingetragenVon,
      eingetragenAm: schema.personen.eingetragenAm,
      abgeglichen: schema.personen.abgeglichen,
      abgeglichenVon: schema.personen.abgeglichenVon,
      abgeglichenAm: schema.personen.abgeglichenAm,
      updatedAt: schema.personen.updatedAt,
      gruppeId: schema.personen.gruppeId,
      gruppeName: schema.gruppen.name,
    })
    .from(schema.personen)
    .innerJoin(schema.gruppen, eq(schema.personen.gruppeId, schema.gruppen.id))
    .orderBy(asc(schema.gruppen.name), asc(schema.personen.nachname), asc(schema.personen.vorname));
}

export type PersonMitGruppe = Awaited<ReturnType<typeof listPersonenMitGruppe>>[number];

export async function createPerson(input: PersonInput) {
  const [person] = await db.insert(schema.personen).values(input).returning();
  return person;
}

export async function updatePerson(id: number, input: PersonInput) {
  const [person] = await db
    .update(schema.personen)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(schema.personen.id, id))
    .returning();
  if (!person) throw new DomainError("NOT_FOUND", "Person nicht gefunden.");
  return person;
}

export async function deletePerson(id: number) {
  const [person] = await db.delete(schema.personen).where(eq(schema.personen.id, id)).returning();
  if (!person) throw new DomainError("NOT_FOUND", "Person nicht gefunden.");
}

export async function setAbgeglichen(id: number, abgeglichen: boolean, von?: string) {
  const [person] = await db
    .update(schema.personen)
    .set({
      abgeglichen,
      abgeglichenVon: abgeglichen ? von ?? null : null,
      abgeglichenAm: abgeglichen ? new Date() : null,
    })
    .where(eq(schema.personen.id, id))
    .returning();
  if (!person) throw new DomainError("NOT_FOUND", "Person nicht gefunden.");
  return person;
}
