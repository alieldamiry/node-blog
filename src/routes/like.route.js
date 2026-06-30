import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import * as likeController from "../controllers/like.controller.js";

const router = Router();
router
  .route("/")
  .post(authController.protect, likeController.create)
  .delete(authController.protect, likeController.deleteLike);

export default router;
