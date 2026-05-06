import { Router } from "express";
const router = Router();
import * as postController from "../controllers/post.controller.js";
import * as authController from "../controllers/auth.controller.js";
import * as postModel from "../models/post.model.js";
import { validate } from "../middleware/validate.js";
import {
  createPostSchema,
  getAllPostsSchema,
  getPostByIdSchema,
  updatePostSchema,
} from "../schemas/post.schema.js";

router
  .route("/")
  .get(validate(getAllPostsSchema), postController.getAll)
  .post(
    authController.protect,
    validate(createPostSchema),
    postController.create,
  );

router.get(
  "/me",
  authController.protect,
  authController.restrictToOwnerOrRoles("admin"),
  postController.getMe,
);

router.route("/trending").get(postController.getTrending);
router
  .route("/:id")
  .get(validate(getPostByIdSchema), postController.getById)
  .patch(
    authController.protect,
    authController.restrictToOwnerOrRoles(
      postModel,
      ["admin"],
      "author_info.id",
    ),
    validate(updatePostSchema),
    postController.update,
  )
  .delete(
    authController.protect,
    authController.restrictToOwnerOrRoles(
      postModel,
      ["admin"],
      "author_info.id",
    ),
    postController.deletePost,
  );

export default router;
