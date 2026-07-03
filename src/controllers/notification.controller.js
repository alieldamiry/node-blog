import { catchAsync } from "../utils/catchAsync.js";
import * as notificationModel from "../models/notification.model.js";

export const getAllByUserId = catchAsync(async (req, res) => {
  const { id: user_id } = req.user;
  const notificiations = await notificationModel.getAllByUserId(user_id);
  res.status(200).json({ status: "success", data: notificiations });
});

export const toggleNotificationRead = catchAsync(async (req, res) => {
  const { id: user_id } = req.user;
  const { notificationId } = req.params;
  await notificationModel.toggleNotificationRead(user_id, notificationId);
  res.status(200).json({ status: "success" });
});