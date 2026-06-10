import multer from "multer";
import { AppError } from "../utils/appError.js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `File type not allowed. Accepted: ${ALLOWED_TYPES.join(", ")}`,
        400,
      ),
    );
  }
};

export const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter,
}).single("avatar"); // field name the client sends
