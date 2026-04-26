import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

export const pool = new Pool(dbConfig);

export async function initDb() {
  try {
    // Just test connection to the actual database
    const client = await pool.connect();

    await client.query('SELECT 1'); // simple health check

    client.release();
  } catch (err) {
    throw new Error(`Database connection failed: ${err.message}`);
  }
}
