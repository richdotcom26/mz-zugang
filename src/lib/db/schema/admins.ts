import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Verantwortliche, die sich im Portal mit "Ich bin ..." identifizieren
 * (kein Login pro Person, nur Vorbelegung für "Eingetragen von" etc.).
 */
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Admin = typeof admins.$inferSelect;
export type NeuerAdmin = typeof admins.$inferInsert;
