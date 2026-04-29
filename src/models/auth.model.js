import { pool } from "../config/db.js";

export const getByEmail = async (email) => {
  const result = await pool.query(
    `
            select id, email, first_name, last_name, password, role, is_verified, created_at, updated_at
            from users
            where email=$1
            `,
    [email],
  );
  return result.rows.at(0);
};
