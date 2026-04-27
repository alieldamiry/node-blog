import * as postModel from "../models/post.model.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getAll = catchAsync(async (req, res) => {
  const posts = await postModel.getAll({
    ...req.query,
  });
  res.json({ status: "success", count: posts.length, data: posts });
});

export const getTrending = catchAsync(async (req, res) => {
  const posts = await postModel.getTrending({
    ...req.query,
  });
  res.json({ status: "success", count: posts.length, data: posts });
});

export const getById = catchAsync(async (req, res) => {
  const posts = await postModel.getById(req.params.id);
  res.json({ status: "success", data: posts });
});

export const create = catchAsync(async (req, res) => {
  const { title, content, isPublished } = req.body;
  const userId = "b89d0212-d3a3-4c52-8aac-7ddde7760c47"; // from auth middleware later
  const post = await postModel.create({
    userId,
    title,
    content,
    isPublished,
  });
  res.status(201).json(post);
});

export const update = catchAsync(async (req, res) => {
  const post = await postModel.update(req.params.id, req.body);
  res.json({ status: "success", data: post });
});

export const deletePost = catchAsync(async (req, res) => {
  await postModel.deletePost(req.params.id);
  res.status(204).json({ status: "success", data: null });
});
