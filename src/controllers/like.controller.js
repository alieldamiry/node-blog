import * as likeModel from "../models/like.model.js";
import * as postModel from "../models/post.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import { notificationQueue } from "../bullmq/queues/notifications-queue.js";

export const create = catchAsync(async (req, res) => {
  const { id: user_id, name } = req.user;
  console.log("req.body:", req.body);
  const { post_id } = req.body;
  const like = await likeModel.create(user_id, post_id);

  // creating notification background job
  const post = await postModel.getById(post_id);
  notificationQueue.add("post_liked", {
    postOwnerId: post.author_info.id,
    likedByUsername: name,
    post_id,
  });

  res.status(201).json({ status: "success", data: like });
});

export const deleteLike = catchAsync(async (req, res) => {
  const { id: user_id } = req.user;
  const { post_id } = req.body;
  const like = await likeModel.deleteLike(user_id, post_id);
  res.status(204).json({ status: "success", data: like });
});
