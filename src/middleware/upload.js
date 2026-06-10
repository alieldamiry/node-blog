import multer from "multer";
import path from "path";
import { AppError } from "../utils/appError.js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

// const storage = multer.diskStorage({
//   destination: "uploads/", // local disk for now; swap for memory later when using Cloudinary
//   filename: (_req, file, cb) => {
//     console.log("file", file);

//     const ext = path.extname(file.originalname);
//     console.log("ext", ext);

//     const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     cb(null, `${unique}${ext}`);
//   },
// });

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
