import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    email: z.email(),
    first_name: z.string().min(3),
    last_name: z.string().min(3),
    password: z.string().min(4),
    role: z.enum(["admin", "user"]),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    first_name: z.string().min(3),
    last_name: z.string().min(3),
  }).partial(),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
