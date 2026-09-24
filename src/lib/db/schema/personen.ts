import { boolean, date, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { gruppen } from "./gruppen";

/**
 * Personen mit Gebäudezugang, wie von den Verantwortlichen gesammelt.
 * `abgleichKeyverwaltungAm` ist der Marker: gesetzt, sobald Friedhelm (Key-Verwaltung)
 * die Person mit der Transponder-Software abgeglichen hat (Transponder bleibt aktiv).
 * Alle Personen, die nach dem Abgleich NICHT auf der Liste stehen bzw. nicht
 * abgeglichen sind, werden dort gesperrt.
 * `aktiv` = false bedeutet: Zugang soll gesperrt werden (Person bleibt in der Liste,
 * zählt aber nicht mehr als aktiv zugangsberechtigt).
 */
export const personen = pgTable("personen", {
  id: serial("id").primaryKey(),
  vorname: text("vorname").notNull(),
  nachname: text("nachname").notNull(),
  gruppeId: integer("gruppe_id")
    .notNull()
    .references(() => gruppen.id, { onDelete: "restrict" }),
  istHauptkontakt: boolean("ist_hauptkontakt").notNull().default(false),
  aktiv: boolean("aktiv").notNull().default(true),
  aktivGeaendertAm: timestamp("aktiv_geaendert_am", { withTimezone: true }),
  transponderNr: text("transponder_nr"),
  telefon: text("telefon"),
  email: text("email"),
  bemerkung: text("bemerkung"),

  befristetBis: date("befristet_bis", { mode: "string" }),
  transponderAusgabeAm: date("transponder_ausgabe_am", { mode: "string" }),
  transponderRueckgabeAm: date("transponder_rueckgabe_am", { mode: "string" }),

  eingetragenVon: text("eingetragen_von"),
  eingetragenAm: timestamp("eingetragen_am", { withTimezone: true }).notNull().defaultNow(),

  abgleichKeyverwaltungAm: date("abgleich_keyverwaltung_am", { mode: "string" }),

  // Transponder-Übergabebeleg: digitale Unterschrift (PNG als Data-URL) + Zeitpunkt.
  uebergabeSignatur: text("uebergabe_signatur"),
  uebergabeSignaturAm: timestamp("uebergabe_signatur_am", { withTimezone: true }),

  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Person = typeof personen.$inferSelect;
export type NeuePerson = typeof personen.$inferInsert;
