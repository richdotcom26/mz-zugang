import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Räume, zu denen Personen Zugang haben können (frei erweiterbar, analog zu Gruppen).
 */
export const raeume = pgTable("raeume", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Raum = typeof raeume.$inferSelect;
export type NeuerRaum = typeof raeume.$inferInsert;
