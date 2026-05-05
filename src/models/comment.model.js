import { prisma } from "../lib/prisma.js";

export const getByPostId = async (post_id) => {
  const comments = await prisma.comments.findMany({
    where: { post_id },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      post_id: true,
      content: true,
      users: {
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });

  return comments.map(({ users, ...comment }) => ({
    ...comment,
    user_info: users,
  }));
};

export const getById = async (id) => {
  const comment = await prisma.comments.findUnique({
    where: { id },
    select: {
      id: true,
      post_id: true,
      content: true,
      users: {
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });

  if (!comment) return null;

  const { users, ...commentData } = comment;

  return {
    ...commentData,
    user_info: users,
  };
};

export const create = async ({ post_id, user_id, content }) => {
  const comment = await prisma.comments.create({
    data: {
      user_id,
      post_id,
      content,
    },
  });

  return comment;
};

export const update = async (id, { content }) => {
  const comment = await prisma.comments.update({
    where: { id },
    data: {
      content,
    },
  });

  return comment;
};

export const deleteComment = async (id) => {
  await prisma.comments.delete({
    where: { id },
  });
};
