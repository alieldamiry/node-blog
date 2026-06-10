import multer from "multer";
import { uploadSingle } from "../middleware/upload.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../lib/cloudinary.js";
import { catchAsync } from "../utils/catchAsync.js";
import { updateAvatarUrl } from "../models/user.model.js";
import * as userModel from "../models/user.model.js";

export const uploadAvatar = catchAsync(async (req, res, next) => {
  uploadSingle(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("File too large. Max 5MB.", 400));
      }
      return next(new AppError(err.message, 400));
    }
    if (err) return next(err);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const user = await userModel.getById(req.user.id);
    console.log({ user });
    if (user.avatar_public_id) {
      await deleteFromCloudinary(user.avatar_public_id).catch(() => {
        logger.error("failed deleting previous couldinary avatar");
      });
    }

    const { url, publicId } = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
    );
    await updateAvatarUrl(req.user.id, url, publicId);

    res.json({
      message: "Avatar uploaded successfully",
      url,
    });
  });
});
