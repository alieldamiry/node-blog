import { prisma } from "../lib/prisma.js";

export const getAll = async () => {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      role: true,
      is_verified: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });
  return users;
};

export const getById = async (id) => {
  const user = await prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      role: true,
      is_verified: true,
      created_at: true,
      updated_at: true,
    },
  });
  return user;
};

export const getUsersActivity = async () => {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      _count: {
        select: {
          posts: true,
          likes: true,
          comments: true,
        },
      },
      posts: {
        select: {
          title: true,
        },
        orderBy: {
          created_at: "desc",
        },
        take: 1,
      },
    },
  });

  return users.map((user) => ({
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    total_posts: user._count.posts,
    total_likes: user._count.likes,
    total_comments: user._count.comments,
    latest_post_title: user.posts[0]?.title || null,
  }));
};

export const create = async (input) => {
  const user = await prisma.users.create({
    data: {
      email: input.email,
      first_name: input.first_name,
      last_name: input.last_name,
      role: input.role,
      password: input.password,
    },
  });
  return user;
};

export const update = async (id, input) => {
  const user = await prisma.users.update({
    where: { id },
    data: {
      first_name: input.first_name,
      last_name: input.last_name,
    },
  });
  return user;
};

export const deleteUser = async (id) => {
  await prisma.users.delete({
    where: { id },
  });
};
