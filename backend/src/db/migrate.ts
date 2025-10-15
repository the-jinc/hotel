import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { migrate } from "drizzle-orm/postgres-js/migrator";

import { connection, db } from "./index.js";

async function main() {
  console.log("⏳ Running migrations...");

  const start = Date.now();

  const migrationsFolder = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../db/migrations"
  );

  await migrate(db, { migrationsFolder });

  const end = Date.now();

  console.log(`✅ Migrations completed in ${end - start}ms`);
}

main()
  .then(async () => {
    await connection.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("❌ Migration failed");
    console.error(err);
    await connection.end().catch(() => undefined);
    process.exit(1);
  });
