import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { gruppen } from "./gruppen";

/**
 * Personen mit Gebäudezugang, wie von den Verantwortlichen gesammelt.
 * `abgeglichen` ist der Marker: gesetzt, sobald die Person mit der
 * Transponder-Software abgeglichen wurde (Transponder bleibt aktiv).
 * Alle Personen, die nach dem Abgleich NICHT auf der Liste stehen bzw.
 * nicht abgeglichen sind, werden dort gesperrt.
 */
export const personen = pgTable("personen", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  gruppeId: integer("gruppe_id")
    .notNull()
    .references(() => gruppen.id, { onDelete: "restrict" }),
  transponderNr: text("transponder_nr"),
  bemerkung: text("bemerkung"),

  eingetragenVon: text("eingetragen_von"),
  eingetragenAm: timestamp("eingetragen_am", { withTimezone: true }).notNull().defaultNow(),

  abgeglichen: boolean("abgeglichen").notNull().default(false),
  abgeglichenVon: text("abgeglichen_von"),
  abgeglichenAm: timestamp("abgeglichen_am", { withTimezone: true }),

  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Person = typeof personen.$inferSelect;
export type NeuePerson = typeof personen.$inferInsert;
