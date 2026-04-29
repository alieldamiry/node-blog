import { pool } from "../config/db.js";

export const getByPostId = async (post_id) => {
  const result = await pool.query(
    `
      select comments.id, post_id, content,
      json_build_object(
                'id',         users.id,
                'email',      users.email,
                'first_name',  users.first_name,
                'last_name',   users.last_name
            ) AS user_info from comments join users on(users.id=comments.user_id)
where post_id=$1
order by comments.created_at desc
        `,
    [post_id],
  );
  return result.rows;
};

export const getById = async (id) => {
  const result = await pool.query(
    `
    SELECT comments.id, post_id, content,
      json_build_object(
        'id',         users.id,
        'email',      users.email,
        'first_name', users.first_name,
        'last_name',  users.last_name
      ) AS user_info
    FROM comments
    JOIN users ON users.id = comments.user_id
    WHERE comments.id = $1
    `,
    [id],
  );
  return result.rows[0];
};

export const create = async ({ post_id, user_id, content }) => {
  const result = await pool.query(
    `
        insert into comments (user_id, post_id, content)
        values($1, $2, $3)
        returning *
        `,
    [user_id, post_id, content],
  );
  return result.rows.at(0);
};

export const update = async (id, { content }) => {
  const result = await pool.query(
    `
        UPDATE comments
        SET 
            content = COALESCE($1, content)
        WHERE id = $2
        RETURNING *
    `,
    [content, id],
  );

  return result.rows[0];
};

export const deleteComment = async (id) => {
  await pool.query(`delete from comments where id=$1`, [id]);
};
