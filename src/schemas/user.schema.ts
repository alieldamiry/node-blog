import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    email: z.email(),
    first_name: z.string().min(3),
    last_name: z.string().min(3),
    password: z.string().min(8),
    role: z.enum(["admin", "user"]),
  }),
});
