import * as postModel from "../models/post.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import redis from "../config/redis.js";

export const getAll = catchAsync(async (req, res) => {
  const posts = await postModel.getAll({
    ...req.query,
  });
  res.json({ status: "success", ...posts });
});

export const getMe = catchAsync(async (req, res) => {
  const posts = await postModel.getAll({
    ...req.query,
    user_id: req.user.id,
  });
  res.json({ status: "success", ...posts });
});

export const getTrending = catchAsync(async (req, res) => {
  const posts = await postModel.getTrending({
    ...req.query,
  });
  res.json({ status: "success", count: posts.length, data: posts });
});

// export const getById = catchAsync(async (req, res) => {
//   const posts = await postModel.getById(req.params.id);
//   res.json({ status: "success", data: posts });
// });

export const getById = catchAsync(async (req, res) => {
  const cacheKey = `post:${req.params.id}`;
  const cachedData = await redis.get(cacheKey);
  console.log({ cachedData });
  if (!cachedData) {
    const post = await postModel.getById(req.params.id);
    await redis.set(cacheKey, JSON.stringify(post), "EX", 60);
    res.json({ status: "success", data: post });
  } else {
    console.log({ cachedData });
    res.json({ status: "success", data: JSON.parse(cachedData) });
  }
});

export const create = catchAsync(async (req, res) => {
  const { title, content, is_published } = req.body;
  const userId = req.user.id;
  const post = await postModel.create({
    userId,
    title,
    content,
    is_published,
  });
  res.status(201).json(post);
});

export const update = catchAsync(async (req, res) => {
  const cacheKey = `post:${req.params.id}`;
  const post = await postModel.update(req.params.id, req.body);
  await redis.del(cacheKey);
  res.json({ status: "success", data: post });
});

export const deletePost = catchAsync(async (req, res) => {
  const cacheKey = `post:${req.params.id}`;
  await postModel.deletePost(req.params.id);
  await redis.del(cacheKey);
  res.status(204).json({ status: "success", data: null });
});
