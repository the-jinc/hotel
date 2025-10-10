import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import "dotenv/config";

// Create the connection
const connectionString = process.env.DATABASE_URL!;

export const connection = postgres(connectionString, { prepare: false });
export const db = drizzle(connection, { schema });

export type Database = typeof db;
