import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

// Minimal admin-only seeding for production environments
// Idempotent: will not modify existing admin if found

async function ensureAdmin() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL is required for admin seed");
    process.exit(1);
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@hotel.com";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("❌ ADMIN_PASSWORD must be set (secure production secret)");
    process.exit(1);
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  try {
    console.log("🔐 Checking for existing admin user...");
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existing.length > 0) {
      console.log(
        `✅ Admin user already exists (email: ${adminEmail}) - skipping creation`
      );
      return;
    }

    console.log("➕ Creating admin user...");
    const hashed = await bcrypt.hash(adminPassword, 12);
    await db.insert(users).values({
      email: adminEmail,
      password: hashed,
      firstName: "System",
      lastName: "Administrator",
      role: "admin",
      phone: "+1-000-000-0000",
    });

    console.log(`🎉 Admin user created (email: ${adminEmail})`);
  } catch (err) {
    console.error("❌ Failed to seed admin user:", err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

ensureAdmin().then(() => {
  console.log("✅ Admin seed script finished");
});
