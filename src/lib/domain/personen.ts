import "server-only";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { DomainError } from "./errors";

// Leeres Feld -> `null` (nicht `undefined`): drizzle lässt `undefined`-Werte beim
// Update unangetastet, ein geleertes Feld muss die Spalte aber aktiv auf NULL setzen.
const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

export const personSchema = z.object({
  vorname: z.string().trim().min(1, "Pflichtfeld"),
  nachname: z.string().trim().min(1, "Pflichtfeld"),
  gruppeId: z.coerce.number().int().positive("Bitte eine Gruppe wählen"),
  istHauptkontakt: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  transponderNr: optionalText,
  telefon: optionalText,
  email: optionalText.refine(
    (v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    "Ungültige E-Mail-Adresse",
  ),
  bemerkung: optionalText,
  befristetBis: optionalDate,
  transponderAusgabeAm: optionalDate,
  transponderRueckgabeAm: optionalDate,
  abgleichKeyverwaltungAm: optionalDate,
  eingetragenVon: optionalText,
});

export type PersonInput = z.infer<typeof personSchema>;

export async function listPersonenMitGruppe() {
  const personenRows = await db
    .select({
      id: schema.personen.id,
      vorname: schema.personen.vorname,
      nachname: schema.personen.nachname,
      aktiv: schema.personen.aktiv,
      aktivGeaendertAm: schema.personen.aktivGeaendertAm,
      istHauptkontakt: schema.personen.istHauptkontakt,
      transponderNr: schema.personen.transponderNr,
      telefon: schema.personen.telefon,
      email: schema.personen.email,
      bemerkung: schema.personen.bemerkung,
      befristetBis: schema.personen.befristetBis,
      transponderAusgabeAm: schema.personen.transponderAusgabeAm,
      transponderRueckgabeAm: schema.personen.transponderRueckgabeAm,
      eingetragenVon: schema.personen.eingetragenVon,
      eingetragenAm: schema.personen.eingetragenAm,
      abgleichKeyverwaltungAm: schema.personen.abgleichKeyverwaltungAm,
      uebergabeSignatur: schema.personen.uebergabeSignatur,
      uebergabeSignaturAm: schema.personen.uebergabeSignaturAm,
      updatedAt: schema.personen.updatedAt,
      gruppeId: schema.personen.gruppeId,
      gruppeName: schema.gruppen.name,
    })
    .from(schema.personen)
    .innerJoin(schema.gruppen, eq(schema.personen.gruppeId, schema.gruppen.id))
    .orderBy(asc(schema.gruppen.name), asc(schema.personen.nachname), asc(schema.personen.vorname));

  const zuordnungen = await db
    .select({
      personId: schema.personenRaeume.personId,
      raumId: schema.raeume.id,
      raumName: schema.raeume.name,
    })
    .from(schema.personenRaeume)
    .innerJoin(schema.raeume, eq(schema.personenRaeume.raumId, schema.raeume.id))
    .orderBy(asc(schema.raeume.name));

  const raeumeByPerson = new Map<number, { id: number; name: string }[]>();
  for (const z of zuordnungen) {
    const list = raeumeByPerson.get(z.personId) ?? [];
    list.push({ id: z.raumId, name: z.raumName });
    raeumeByPerson.set(z.personId, list);
  }

  return personenRows.map((p) => ({ ...p, raeume: raeumeByPerson.get(p.id) ?? [] }));
}

export type PersonMitGruppe = Awaited<ReturnType<typeof listPersonenMitGruppe>>[number];

export async function createPerson(input: PersonInput, raumIds: number[]) {
  return db.transaction(async (tx) => {
    const [person] = await tx.insert(schema.personen).values(input).returning();
    if (raumIds.length > 0) {
      await tx.insert(schema.personenRaeume).values(raumIds.map((raumId) => ({ personId: person.id, raumId })));
    }
    return person;
  });
}

export async function updatePerson(id: number, input: PersonInput, raumIds: number[]) {
  return db.transaction(async (tx) => {
    const [person] = await tx
      .update(schema.personen)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(schema.personen.id, id))
      .returning();
    if (!person) throw new DomainError("NOT_FOUND", "Person nicht gefunden.");

    await tx.delete(schema.personenRaeume).where(eq(schema.personenRaeume.personId, id));
    if (raumIds.length > 0) {
      await tx.insert(schema.personenRaeume).values(raumIds.map((raumId) => ({ personId: id, raumId })));
    }
    return person;
  });
}

export async function deletePerson(id: number) {
  const [person] = await db.delete(schema.personen).where(eq(schema.personen.id, id)).returning();
  if (!person) throw new DomainError("NOT_FOUND", "Person nicht gefunden.");
}

export async function setAktiv(id: number, aktiv: boolean) {
  const [person] = await db
    .update(schema.personen)
    .set({ aktiv, aktivGeaendertAm: new Date(), updatedAt: new Date() })
    .where(eq(schema.personen.id, id))
    .returning();
  if (!person) throw new DomainError("NOT_FOUND", "Person nicht gefunden.");
  return person;
}

export async function setUebergabeSignatur(id: number, signaturDataUrl: string | null) {
  const [person] = await db
    .update(schema.personen)
    .set({
      uebergabeSignatur: signaturDataUrl,
      uebergabeSignaturAm: signaturDataUrl ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(schema.personen.id, id))
    .returning();
  if (!person) throw new DomainError("NOT_FOUND", "Person nicht gefunden.");
  return person;
}

export async function getPersonMitGruppeById(id: number) {
  const [person] = await db
    .select({
      id: schema.personen.id,
      vorname: schema.personen.vorname,
      nachname: schema.personen.nachname,
      transponderNr: schema.personen.transponderNr,
      uebergabeSignatur: schema.personen.uebergabeSignatur,
      uebergabeSignaturAm: schema.personen.uebergabeSignaturAm,
      gruppeName: schema.gruppen.name,
    })
    .from(schema.personen)
    .innerJoin(schema.gruppen, eq(schema.personen.gruppeId, schema.gruppen.id))
    .where(eq(schema.personen.id, id));
  if (!person) throw new DomainError("NOT_FOUND", "Person nicht gefunden.");

  const raeume = await db
    .select({ name: schema.raeume.name })
    .from(schema.personenRaeume)
    .innerJoin(schema.raeume, eq(schema.personenRaeume.raumId, schema.raeume.id))
    .where(eq(schema.personenRaeume.personId, id))
    .orderBy(asc(schema.raeume.name));

  return { ...person, raeume: raeume.map((r) => r.name) };
}

export type PersonBeleg = Awaited<ReturnType<typeof getPersonMitGruppeById>>;
