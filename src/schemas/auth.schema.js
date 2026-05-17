import { z } from "zod";

export const registerSchema = z
  .object({
    body: z.object({
      first_name: z.string().min(1, "First name is required"),
      last_name: z.string().min(1, "Last name is required"),
      email: z.email("Invalid email address"),
      password: z
        .string()
        .min(4, "Password must be at least 4 characters long"),
      passwordConfirm: z
        .string()
        .min(4, "Password confirmation must be at least 4 characters long"),
    }),
  })
  .refine((data) => data.body.password === data.body.passwordConfirm, {
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});
