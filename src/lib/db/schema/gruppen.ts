import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Gruppen sind frei erweiterbar (Musiker, Jugend, Konfis, Senioren, Square-Dance, ...).
 * Verantwortliche legen bei Bedarf neue Gruppen über die Oberfläche an.
 */
export const gruppen = pgTable("gruppen", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Gruppe = typeof gruppen.$inferSelect;
export type NeueGruppe = typeof gruppen.$inferInsert;
