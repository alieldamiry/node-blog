import * as userModel from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import bcrypt from "bcrypt";

export const getAll = catchAsync(async (req, res, next) => {
  const users = await userModel.getAll();
  res.json({ status: "success", data: users });
});

export const getUsersActivity = catchAsync(async (req, res, next) => {
  const users = await userModel.getUsersActivity();
  res.json({ status: "success", data: users });
});

export const getById = catchAsync(async (req, res, next) => {
  const user = (await userModel.getById(req.params.id)) || {};
  res.json({ status: "success", data: user });
});

export const create = catchAsync(async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  req.body.password = hashedPassword;
  const user = await userModel.create(req.body);
  res.status(201).json({ status: "success", data: user });
});

export const update = catchAsync(async (req, res) => {
  const user = await userModel.update(req.params.id, req.body);
  res.json({ status: "success", data: user });
});

export const deleteUser = catchAsync(async (req, res) => {
  await userModel.deleteUser(req.params.id);
  res.status(204).json({ status: "success", data: null });
});
