import { pool } from "../config/db.js";

export const getAllByUserId = async (user_id) => {
  const result = await pool.query(
    `
        select 
        id, user_id, type, message, read, created_at
        from notifications
        where user_id=$1
        order by created_at desc
        `,
    [user_id],
  );

  return result.rows;
};
