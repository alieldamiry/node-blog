import express from "express";
import cors from "cors";
import usersRouter from "./routes/user.route.js";
import postsRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import authRouter from "./routes/auth.route.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { AppError } from "./utils/appError.js";
import { prisma } from "./lib/prisma.js";

export const app = express();

app.use(cors());

app.use(express.json());

app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/comments", commentRouter);
app.use("/auth", authRouter);

// health check endpoint
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "ok" });
  } catch (err) {
    res.status(503).json({ status: "degraded", db: "fail" });
  }
});

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);
