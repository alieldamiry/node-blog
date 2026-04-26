import { pool } from "../config/db.js";

export const getAll = async () => {
  const result = await pool.query(`
            select id, email, first_name, last_name, role, is_verified, created_at, updated_at
            from users
            order by created_at desc;
            `);
  return result.rows;
};

export const getById = async (id) => {
  const result = await pool.query(
    `
            select id, email, first_name, last_name, role, is_verified, created_at, updated_at
            from users
            where id=$1
            `,
    [id],
  );
  return result.rows.at(0);
};

export const getUsersActivity = async () => {
  const result = await pool.query(`
  select 
  u.id,
  u.first_name,
  u.last_name,
  u.email,
  coalesce(p.total_posts, 0) as total_posts,
  coalesce(l.total_likes, 0) as total_likes,
  coalesce(c.total_comments, 0) as total_comments,
  lp.title as latest_post_title
from users u
left join (
  select user_id, count(*) as total_posts
  from posts
  group by user_id
) p on p.user_id = u.id
left join (
  select user_id, count(*) as total_likes
  from likes
  group by user_id
) l on l.user_id = u.id
left join (
  select user_id, count(*) as total_comments 
  from comments 
  group by user_id
) c on c.user_id = u.id
left join (
  select distinct on (user_id)
    user_id,
    title
  from posts
  order by user_id, created_at desc
) lp on lp.user_id = u.id;

            `);
  return result.rows;
};
export const create = async (input) => {
  const result = await pool.query(
    `
        insert into users (email, first_name, last_name, role, password)
        values($1, $2, $3, $4, $5)
        returning *
        `,
    [input.email, input.firstName, input.lastName, input.role, input.password],
  );
  return result.rows.at(0);
};

export const update = async (id, { first_name, last_name, password }) => {
  const result = await pool.query(
    `
        UPDATE users
        SET 
            first_name        = COALESCE($1, first_name),
            last_name      = COALESCE($2, last_name),
            password = COALESCE($3, password)
        WHERE id = $4
        RETURNING *
    `,
    [first_name, last_name, password, id],
  );

  return result.rows[0];
};

export const deleteUser = async (id) => {
  await pool.query(`delete from users where id=$1`, [id]);
};
