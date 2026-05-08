import { Pool } from "pg";

declare global {
  var postgresPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables.");
}

export const db =
  global.postgresPool ??
  new Pool({
    connectionString,
  });

if (process.env.NODE_ENV !== "production") {
  global.postgresPool = db;
}

export async function testDatabaseConnection() {
  const client = await db.connect();

  try {
    const result = await client.query("SELECT NOW() AS current_time, current_database() AS database_name");
    return result.rows[0];
  } finally {
    client.release();
  }
}
