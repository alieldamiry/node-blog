import { pool } from "../config/db.js";

const ALLOWED_SORT_FIELDS = {
  created_at: "posts.created_at",
  title: "posts.title",
  total_likes: "total_likes",
  updated_at: "posts.updated_at",
  author: "author",
};

export const getAll = async ({
  search,
  is_published,
  user_id,
  page = 1,
  limit = 5,
  sortBy = "-created_at",
} = {}) => {
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`posts.title ILIKE $${params.length}`);
  }

  if (is_published !== undefined) {
    params.push(is_published);
    conditions.push(`posts.is_published = $${params.length}`);
  }

  if (user_id) {
    params.push(user_id);
    conditions.push(`posts.user_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortKey = sortBy.startsWith("-") ? sortBy.slice(1) : sortBy;
  const sortField = ALLOWED_SORT_FIELDS[sortKey] ?? "posts.created_at";
  const sortOrder = sortBy.startsWith("-") ? "DESC" : "ASC";
  const orderBy = `ORDER BY ${sortField} ${sortOrder}`;
  console.log({ orderBy });

  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const [result, countResult] = await Promise.all([
    pool.query(
      `
      SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.is_published,
        posts.created_at,
        posts.updated_at,
        CONCAT(users.first_name, ' ', users.last_name) AS author,
        COALESCE(l.total_likes, 0) AS total_likes
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN (
        SELECT post_id, COUNT(user_id)::int AS total_likes
        FROM likes GROUP BY post_id
      ) l ON l.post_id = posts.id
      ${where}
      ${orderBy}
      LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params,
    ),
    pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM posts
      JOIN users ON posts.user_id = users.id
      ${where}
      `,
      params.slice(0, -2),
    ),
  ]);

  return {
    data: result.rows,
    meta: {
      total: countResult.rows[0].total,
      page: +page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  };
};

export const getTrending = async ({ page = 1, limit = 5 } = {}) => {
  const conditions = [];
  const params = [];

  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const [result, countResult] = await Promise.all([
    pool.query(
      `
      SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.is_published,
        posts.created_at,
        posts.updated_at,
        CONCAT(users.first_name, ' ', users.last_name) AS author,
        COALESCE(l.total_likes, 0) AS total_likes,
        COALESCE(c.total_comments, 0) AS total_comments
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN (
        SELECT post_id, COUNT(user_id)::int AS total_likes
        FROM likes GROUP BY post_id
      ) l ON l.post_id = posts.id
        LEFT JOIN (
        SELECT post_id, COUNT(user_id)::int AS total_comments
        FROM comments GROUP BY post_id
      ) c ON c.post_id = posts.id
       WHERE posts.created_at >= NOW() - INTERVAL '7 days'
       ORDER BY total_likes DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params,
    ),
    pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.created_at >= NOW() - INTERVAL '7 days'
      `,
      params.slice(0, -2),
    ),
  ]);

  return {
    data: result.rows,
    meta: {
      total: countResult.rows[0].total,
      page: +page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  };
};

export const getById = async (id) => {
  const result = await pool.query(
    `
        SELECT
            posts.id,
            posts.title, 
            posts.content,
            posts.is_published,
            posts.created_at,
            posts.updated_at,
            json_build_object(
                'id',         users.id,
                'email',      users.email,
                'first_name',  users.first_name,
                'last_name',   users.last_name,
                'role',       users.role,
                'is_verified', users.is_verified,
                'created_at',  users.created_at
            ) AS author_info
        FROM posts
        JOIN users ON posts.user_id = users.id
        WHERE posts.id = $1
    `,
    [id],
  );
  return result.rows[0];
};

export const create = async ({ userId, title, content, isPublished }) => {
  const result = await pool.query(
    `
        insert into posts (user_id, title, content, is_published)
        values($1, $2, $3, $4)
        returning *
        `,
    [userId, title, content, isPublished],
  );
  return result.rows.at(0);
};

export const update = async (id, { title, content, is_published }) => {
  const result = await pool.query(
    `
        UPDATE posts
        SET 
            title        = COALESCE($1, title),
            content      = COALESCE($2, content),
            is_published = COALESCE($3, is_published)
        WHERE id = $4
        RETURNING *
    `,
    [title, content, is_published, id],
  );

  return result.rows[0];
};

export const deletePost = async (id) => {
  await pool.query(`delete from posts where id=$1`, [id]);
};
