import * as commentModel from "../models/comment.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import * as postModel from "../models/post.model.js";
import { notificationQueue } from "../bullmq/queues/notifications-queue.js";

export const getByPostId = catchAsync(async (req, res) => {
  const postId = req.query.post_id;
  const comments = await commentModel.getByPostId(postId);
  res.json({ status: "success", data: comments });
});

export const create = catchAsync(async (req, res) => {
  const { content, post_id } = req.body;
  const { id: user_id, name } = req.user;
  const comment = await commentModel.create({
    user_id,
    post_id,
    content,
  });

  // creating notification background job
  const post = await postModel.getById(post_id);
  notificationQueue.add("post_commented", {
    postOwnerId: post.author_info.id,
    commentedBy: name,
    comment_id: comment.id,
  });

  res.status(201).json({ status: "success", data: comment });
});

export const update = catchAsync(async (req, res) => {
  const comment = await commentModel.update(req.params.id, req.body);
  res.json({ status: "success", data: comment });
});

export const deleteComment = catchAsync(async (req, res) => {
  await commentModel.deleteComment(req.params.id);
  res.status(204).json({ status: "success", data: null });
});
