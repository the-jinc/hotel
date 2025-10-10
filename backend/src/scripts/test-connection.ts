import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://hotel_user:hotel_password@localhost:5432/hotel_db";

async function testConnection() {
  console.log("Testing database connection...");
  console.log("Connection string:", connectionString);

  try {
    const client = postgres(connectionString);
    const db = drizzle(client);

    // Simple query to test connection
    const result = await client`SELECT NOW() as current_time`;
    console.log("✅ Database connection successful!");
    console.log("Current time:", result[0].current_time);

    await client.end();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}

testConnection();
