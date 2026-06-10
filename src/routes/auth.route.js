import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import * as uploadController from "../controllers/upload.controller.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router
  .route("/register")
  .post(validate(registerSchema), authController.register);

router.route("/login").post(validate(loginSchema), authController.login);

router.route("/me").get(authController.protect, authController.getMe);

router.post(
  "/me/avatar",
  authController.protect,
  uploadController.uploadAvatar,
);

export default router;
