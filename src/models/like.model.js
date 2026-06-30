import { pool } from "../config/db.js";

export const create = async (user_id, post_id) => {
  const result = await pool.query(
    `
            insert into likes (user_id, post_id)
            values ($1, $2)
            returning *
            `,
    [user_id, post_id],
  );
  return result.rows.at(0);
};

export const deleteLike = async (user_id, post_id) => {
  pool.query(
    `
            delete from likes
            where user_id=$1 and post_id=$2
            returning *
            `,
    [user_id, post_id],
  );
};
