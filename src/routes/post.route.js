import { Router } from "express";
import * as postController from "../controllers/post.controller.js";
import * as authController from "../controllers/auth.controller.js";
import * as postModel from "../models/post.model.js";

const router = Router();
router
  .route("/")
  .get(postController.getAll)
  .post(authController.protect, postController.create);

router.get(
  "/me",
  authController.protect,
  authController.restrictToOwnerOrRoles("admin"),
  postController.getMe,
);

router.route("/trending").get(postController.getTrending);
router
  .route("/:id")
  .get(postController.getById)
  .patch(
    authController.protect,
    authController.restrictToOwnerOrRoles(
      postModel,
      ["admin"],
      "author_info.id",
    ),
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
