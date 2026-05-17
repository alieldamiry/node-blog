import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router
  .route("/register")
  .post(validate(registerSchema), authController.register);

router.route("/login").post(validate(loginSchema), authController.login);

export default router;
