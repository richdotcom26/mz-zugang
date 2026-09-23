import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";

// Eigener, "server-only"-freier Client (das Paket wirft außerhalb von Next.js).
const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client, { schema, casing: "snake_case" });

const START_GRUPPEN = ["Musiker", "Jugend", "Konfis", "Senioren", "Square-Dance"];

async function main() {
  for (const name of START_GRUPPEN) {
    await db.insert(schema.gruppen).values({ name }).onConflictDoNothing();
  }
  console.log(`Fertig. Start-Gruppen vorhanden: ${START_GRUPPEN.join(", ")}`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
