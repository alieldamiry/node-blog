import { z } from "zod";
import { ALLOWED_SORT_FIELDS } from "../models/post.model.js";

export const getAllPostsSchema = z.object({
  query: z.object({
    id: z.string().uuid().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).default("5"),
    sort_by: z
      .enum(
        Object.keys(ALLOWED_SORT_FIELDS)
          .map((el) => [el, `-${el}`])
          .flat(),
      )
      .default("-created_at"),
    search: z.string().optional(),
    is_published: z.enum(["true", "false"]).optional(),
    user_id: z.string().uuid().optional(),
  }),
});

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    content: z.string().min(10),
    is_published: z.boolean(),
  }),
});

export const updatePostSchema = z.object({
  body: z
    .object({
      title: z.string().min(3),
      content: z.string().min(10),
      is_published: z.boolean(),
    })
    .partial(),
});

export const getPostByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
