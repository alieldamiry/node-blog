import * as userModel from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getAll = catchAsync(async (req, res, next) => {
  const users = await userModel.getAll();
  res.json({ stauts: "success", data: users });
});

export const getUsersActivity = catchAsync(async (req, res, next) => {
  const users = await userModel.getUsersActivity();
  res.json({ stauts: "success", data: users });
});

export const getById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    return next(new AppError(`Invalid UUID: "${id}"`, 400));
  }
  const user = (await userModel.getById(req.params.id)) || {};
  res.json({ stauts: "success", data: user });
});

export const create = catchAsync(async (req, res) => {
  const user = await userModel.create(req.body);
  res.status(201).json({ stauts: "success", data: user });
});

export const update = catchAsync(async (req, res) => {
  const user = await userModel.update(req.params.id, req.body);
  res.json({ stauts: "success", data: user });
});

export const deleteUser = catchAsync(async (req, res) => {
  await userModel.deleteUser(req.params.id);
  res.status(204).json({ stauts: "success", data: null });
});
