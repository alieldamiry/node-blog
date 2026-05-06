import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(500),
    post_id: z.string().uuid(),
  }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(500),
  }),
});

export const getCommentByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
