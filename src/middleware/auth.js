import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";

import { Router } from "express";
import { uploadSingle } from "../middleware/upload";
import { authenticate } from "../middleware/auth"; // your existing auth

const router = Router();

router.post(
  "/me/avatar",
  authenticate,
  (req, res, next) => {
    uploadSingle(req, res, (err) => {
      // Multer errors don't go through Express error middleware automatically
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new AppError("File too large. Max 5MB.", 400));
        }
        return next(new AppError(err.message, 400));
      }
      if (err) return next(err);
      next();
    });
  },
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // TODO tomorrow: upload to Cloudinary instead of saving locally
    res.json({
      message: "Upload received",
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  },
);

export default router;
