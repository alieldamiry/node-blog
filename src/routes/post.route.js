import { Router } from "express";
import * as postController from "../controllers/post.controller.js";
import * as commentController from "../controllers/comment.controller.js";

const router = Router();
router.route("/").get(postController.getAll).post(postController.create);

router.route("/trending").get(postController.getTrending);
router
  .route("/:id")
  .get(postController.getById)
  .patch(postController.update)
  .delete(postController.deletePost);

export default router;
