import express from "express";
import cors from "cors";
import usersRouter from "./routes/user.route.js";
import postsRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import authRouter from "./routes/auth.route.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { AppError } from "./utils/appError.js";
import { pinoHttp } from "pino-http";
import { logger } from "./utils/logger.js";
import { authLimiter, globalLimiter } from "./config/rateLimiter.js";

const app = express();

app.use(cors());

app.use(express.json());

if (process.env.NODE_ENV !== "test") {
  app.use(pinoHttp({ logger }));
}

// app.use(globalLimiter);

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/posts", postsRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/auth", /*authLimiter,*/ authRouter);

app.use("/health", (req, res) => {
  res.status(200).send("OK");
});

// app.get("/session-test", (req, res) => {
//   req.session.visits = (req.session.visits || 0) + 1;
//   res.json({ visits: req.session.visits });
// });

// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).json({ error: "Internal server error" });
// });

// app.use("/redis-test", async (req, res, next) => {
//   try {
//     await redis.set("hello", "from redis");
//     const value = await redis.get("hello");
//     res.json({ value });
//   } catch (err) {
//     next(err);
//   }
// });

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

export default app;
