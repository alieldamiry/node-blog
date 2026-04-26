import { Router } from "express";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.get("/", userController.getAll);
router.get("/activity", userController.getUsersActivity);
router.post("/", userController.create);
router
  .route("/:id")
  .get(userController.getById)
  .patch(userController.update)
  .delete(userController.deleteUser);

export default router;
