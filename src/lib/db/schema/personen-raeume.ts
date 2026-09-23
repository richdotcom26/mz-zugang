import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { personen } from "./personen";
import { raeume } from "./raeume";

/**
 * Zugang einer Person zu einem Raum (n:m). Eine Person kann Zugang zu mehreren
 * Räumen haben; ein Raum kann von mehreren Personen genutzt werden.
 */
export const personenRaeume = pgTable(
  "personen_raeume",
  {
    personId: integer("person_id")
      .notNull()
      .references(() => personen.id, { onDelete: "cascade" }),
    raumId: integer("raum_id")
      .notNull()
      .references(() => raeume.id, { onDelete: "restrict" }),
  },
  (t) => [primaryKey({ columns: [t.personId, t.raumId] })],
);
