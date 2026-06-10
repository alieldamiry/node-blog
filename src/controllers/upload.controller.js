import multer from "multer";
import { uploadSingle } from "../middleware/upload.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../lib/cloudinary.js";
import { catchAsync } from "../utils/catchAsync.js";
import { updateAvatarUrl, getById } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";

export const uploadAvatar = catchAsync(async (req, res, next) => {
  await new Promise((resolve, reject) => {
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return reject(new AppError("File too large. Max 5MB.", 400));
        }
        return reject(new AppError(err.message, 400));
      }
      if (err) return reject(err);
      resolve();
    });
  });

  if (!req.file) {
    return next(new AppError("No file uploaded", 400));
  }

  const user = await getById(req.user.id);
  if (user.avatar_public_id) {
    await deleteFromCloudinary(user.avatar_public_id).catch(() => {
      logger.error("Failed to delete previous Cloudinary avatar");
    });
  }

  const { url, publicId } = await uploadToCloudinary(
    req.file.buffer,
    req.file.mimetype,
  );

  try {
    await updateAvatarUrl(req.user.id, url, publicId);
  } catch (err) {
    await deleteFromCloudinary(publicId).catch(() => {
      logger.error("Failed to delete orphaned Cloudinary avatar after DB error");
    });
    return next(err);
  }

  res.json({ status: "success", data: { url } });
});
