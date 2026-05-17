import { pool } from "../config/db.js";

export async function truncateAll() {
  await pool.query(`
    TRUNCATE TABLE posts, comments, likes, users RESTART IDENTITY CASCADE
  `);
}
