import express from "express";
import * as authController from "../controllers/auth.controller.js";
import * as adminController from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/jobs", authController.protect, adminController.getJobsStats);

export default router;
