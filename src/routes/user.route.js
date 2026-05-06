import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { createUserSchema, getUserByIdSchema, updateUserSchema } from "../schemas/user.schema.js";
import * as userModel from "../models/user.model.js";

const router = Router();

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAll,
  )
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    validate(createUserSchema),
    userController.create,
  );

router.get(
  "/activity",
  authController.protect,
  authController.restrictTo("admin"),
  userController.getUsersActivity,
);

router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    validate(getUserByIdSchema),
    userController.getById,
  )
  .patch(
    authController.protect,
    authController.restrictToOwnerOrRoles(userModel, ["admin"], "id"),
    validate(updateUserSchema),
    userController.update,
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    userController.deleteUser,
  );

export default router;
