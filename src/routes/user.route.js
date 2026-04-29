import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.get("/", authController.protect, userController.getAll);
router.get("/activity", authController.protect, userController.getUsersActivity);
router.post("/", authController.protect, userController.create);
router
  .route("/:id")
  .get(authController.protect, userController.getById)
  .patch(authController.protect, userController.update)
  .delete(authController.protect, userController.deleteUser);

export default router;
