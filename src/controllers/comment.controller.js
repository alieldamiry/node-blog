import * as commentModel from "../models/comment.model.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getByPostId = catchAsync(async (req, res) => {
  const postId = req.query.post_id;
  const comments = await commentModel.getByPostId(postId);
  res.json({ status: "success", data: comments });
});

export const create = catchAsync(async (req, res) => {
  const { content, post_id } = req.body;
  const userId = req.user.id;
  const comment = await commentModel.create({
    user_id: userId,
    post_id,
    content,
  });
  res.status(201).json(comment);
});

export const update = catchAsync(async (req, res) => {
  const comment = await commentModel.update(req.params.id, req.body);
  res.json({ status: "success", data: comment });
});

export const deleteComment = catchAsync(async (req, res) => {
  await commentModel.deleteComment(req.params.id);
  res.status(204).json({ status: "success", data: null });
});
