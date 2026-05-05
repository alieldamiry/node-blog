import { prisma } from "../lib/prisma.js";

export const getByEmail = async (email) => {
  const user = await prisma.users.findUnique({
    where: { email },
    include: true,
  });
  return user;
};
