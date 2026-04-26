import { Router } from "express";
import * as commentController from "../controllers/comment.controller.js";

const router = Router();

router
  .route("/")
  .get(commentController.getByPostId)
  .post(commentController.create);

router
  .route("/:id")
  .patch(commentController.update)
  .delete(commentController.deleteComment);

export default router;
