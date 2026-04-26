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

// comments
// router
//   .route("/:post_id/comments")
//   .get(commentController.getByPostId)
//   .post(commentController.create);

export default router;
