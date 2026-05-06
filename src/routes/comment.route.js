import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import * as commentController from "../controllers/comment.controller.js";
import * as commentModel from "../models/comment.model.js";
import { validate } from "../middleware/validate.js";
import { createCommentSchema } from "../schemas/comment.schema.js";

const router = Router();

router
  .route("/")
  .get(commentController.getByPostId)
  .post(
    authController.protect,
    validate(createCommentSchema),
    commentController.create,
  );

router
  .route("/:id")
  .patch(
    authController.protect,
    authController.restrictToOwnerOrRoles(
      commentModel,
      ["admin"],
      "user_info.id",
    ),
    commentController.update,
  )
  .delete(
    authController.protect,
    authController.restrictToOwnerOrRoles(
      commentModel,
      ["admin"],
      "user_info.id",
    ),
    commentController.deleteComment,
  );

export default router;
