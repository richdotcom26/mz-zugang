import "server-only";
import { sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { DomainError } from "./errors";

const VERSION = 1;

export async function exportDaten() {
  const [gruppen, raeume, admins, personen, personenRaeume] = await Promise.all([
    db.select().from(schema.gruppen),
    db.select().from(schema.raeume),
    db.select().from(schema.admins),
    db.select().from(schema.personen),
    db.select().from(schema.personenRaeume),
  ]);

  return {
    version: VERSION,
    exportedAt: new Date().toISOString(),
    gruppen,
    raeume,
    admins,
    personen,
    personenRaeume,
  };
}

export type Datensicherung = Awaited<ReturnType<typeof exportDaten>>;

function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

// JSON kennt keine Date-Objekte -- beim Export werden "timestamp"-Spalten zu
// ISO-Strings, beim Re-Import müssen sie für drizzle/postgres-js wieder zu
// echten Date-Objekten werden (sonst: "value.toISOString is not a function").
function reviveDates<T extends Record<string, unknown>>(zeilen: T[], felder: (keyof T)[]): T[] {
  return zeilen.map((zeile) => {
    const kopie = { ...zeile };
    for (const feld of felder) {
      const wert = kopie[feld];
      if (typeof wert === "string") kopie[feld] = new Date(wert) as T[keyof T];
    }
    return kopie;
  });
}

/**
 * Stellt einen kompletten Export wieder her: löscht den aktuellen Datenbestand
 * und ersetzt ihn 1:1 durch den Inhalt der Sicherung (inkl. IDs, damit
 * Beziehungen zwischen Personen/Gruppen/Räumen erhalten bleiben).
 */
export async function importDaten(dump: unknown) {
  if (
    !dump ||
    typeof dump !== "object" ||
    !isArray((dump as Record<string, unknown>).gruppen) ||
    !isArray((dump as Record<string, unknown>).raeume) ||
    !isArray((dump as Record<string, unknown>).admins) ||
    !isArray((dump as Record<string, unknown>).personen) ||
    !isArray((dump as Record<string, unknown>).personenRaeume)
  ) {
    throw new DomainError("VALIDATION", "Datei hat kein bekanntes Sicherungs-Format.");
  }

  const daten = dump as {
    gruppen: (typeof schema.gruppen.$inferInsert)[];
    raeume: (typeof schema.raeume.$inferInsert)[];
    admins: (typeof schema.admins.$inferInsert)[];
    personen: (typeof schema.personen.$inferInsert)[];
    personenRaeume: (typeof schema.personenRaeume.$inferInsert)[];
  };

  const gruppen = reviveDates(daten.gruppen, ["createdAt"]);
  const raeume = reviveDates(daten.raeume, ["createdAt"]);
  const admins = reviveDates(daten.admins, ["createdAt"]);
  const personen = reviveDates(daten.personen, [
    "eingetragenAm",
    "aktivGeaendertAm",
    "uebergabeSignaturAm",
    "updatedAt",
  ]);

  await db.transaction(async (tx) => {
    await tx.delete(schema.personenRaeume);
    await tx.delete(schema.personen);
    await tx.delete(schema.raeume);
    await tx.delete(schema.gruppen);
    await tx.delete(schema.admins);

    if (gruppen.length) await tx.insert(schema.gruppen).values(gruppen);
    if (raeume.length) await tx.insert(schema.raeume).values(raeume);
    if (admins.length) await tx.insert(schema.admins).values(admins);
    if (personen.length) await tx.insert(schema.personen).values(personen);
    if (daten.personenRaeume.length) await tx.insert(schema.personenRaeume).values(daten.personenRaeume);

    // Serial-Sequenzen nach dem Restore mit festen IDs neu ausrichten, sonst
    // kollidieren die nächsten normalen INSERTs mit den importierten IDs.
    for (const tabelle of ["gruppen", "raeume", "admins", "personen"] as const) {
      await tx.execute(
        sql.raw(
          `SELECT setval(pg_get_serial_sequence('${tabelle}', 'id'), COALESCE((SELECT MAX(id) FROM ${tabelle}), 1))`,
        ),
      );
    }
  });

  return {
    gruppen: daten.gruppen.length,
    raeume: daten.raeume.length,
    admins: daten.admins.length,
    personen: daten.personen.length,
    personenRaeume: daten.personenRaeume.length,
  };
}
