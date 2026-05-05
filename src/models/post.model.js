import { prisma } from "../lib/prisma.js";

export const getAll = async ({
  // filters
  is_published,
  user_id,
  id,
  // search
  search,
  // sorting
  sort_by = "created_at",
  sort_order = "desc",
  // pagination
  page = 1,
  limit = 10,
} = {}) => {
  const where = {
    ...(is_published !== undefined && { is_published }),
    ...(user_id && { user_id }),
    ...(id && { id }),
    ...(search && {
      title: {
        contains: search,
        mode: "insensitive",
      },
    }),
  };

  const orderByMap = {
    created_at: { created_at: sort_order },
    updated_at: { updated_at: sort_order },
    title: { title: sort_order },
    likes: { likes: { _count: sort_order } },
    author: { users: { first_name: sort_order } },
  };

  const orderBy = orderByMap[sort_by] ?? { created_at: "desc" };

  const skip = (page - 1) * limit;

  // Run both queries in parallel
  const [posts, total] = await Promise.all([
    prisma.posts.findMany({
      where,
      orderBy,
      take: limit,
      skip,
      select: {
        id: true,
        title: true,
        content: true,
        is_published: true,
        created_at: true,
        updated_at: true,
        users: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    }),
    prisma.posts.count({ where }),
  ]);

  const formattedPosts = posts.map(({ users, _count, ...post }) => ({
    ...post,
    author: `${users.first_name} ${users.last_name}`,
    total_likes: _count.likes,
  }));

  return {
    data: formattedPosts,
    meta: {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    },
  };
};

export const getTrending = async ({ page = 1, limit = 5 } = {}) => {
  const where = {
    created_at: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
    },
  };

  const orderBy = {
    likes: {
      _count: "desc",
    },
  };

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.posts.findMany({
      where,
      orderBy,
      take: limit,
      skip,
      select: {
        id: true,
        title: true,
        content: true,
        is_published: true,
        created_at: true,
        updated_at: true,
        users: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    }),
    prisma.posts.count({ where }),
  ]);

  const formattedPosts = posts.map(({ users, _count, ...post }) => ({
    ...post,
    author: `${users.first_name} ${users.last_name}`,
    total_likes: _count.likes,
  }));

  return {
    data: formattedPosts,
    meta: {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    },
  };
};

export const getById = async (id) => {
  const post = await prisma.posts.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      is_published: true,
      created_at: true,
      updated_at: true,
      users: {
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          is_verified: true,
          created_at: true,
        },
      },
    },
  });
  return post;
};

export const create = async ({ user_id, title, content, is_published }) => {
  const post = await prisma.posts.create({
    data: {
      user_id,
      title,
      content,
      is_published,
    },
  });
  return post;
};

export const update = async (id, { title, content, is_published }) => {
  const post = await prisma.posts.update({
    where: { id },
    data: {
      title,
      content,
      is_published,
    },
  });
  return post;
};

export const deletePost = async (id) => {
  await prisma.posts.delete({
    where: { id },
  });
};
