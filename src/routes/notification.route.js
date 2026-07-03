import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import * as notificationController from "../controllers/notification.controller.js";

const router = Router();
router
  .route("/")
  .get(authController.protect, notificationController.getAllByUserId);

router
  .route("/:notificationId/read")
  .patch(
    authController.protect,
    notificationController.toggleNotificationRead,
  );

export default router;
