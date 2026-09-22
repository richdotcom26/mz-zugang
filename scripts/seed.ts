import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { db, schema } from "../src/lib/db";

const START_GRUPPEN = ["Musiker", "Jugend", "Konfis", "Senioren", "Square-Dance"];

async function main() {
  for (const name of START_GRUPPEN) {
    await db.insert(schema.gruppen).values({ name }).onConflictDoNothing();
  }
  console.log(`Fertig. Start-Gruppen vorhanden: ${START_GRUPPEN.join(", ")}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
