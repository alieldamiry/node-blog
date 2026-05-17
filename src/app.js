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

const app = express();

app.use(cors());

app.use(express.json());

if (process.env.NODE_ENV !== "test") {
  app.use(pinoHttp({ logger }));
}
app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/comments", commentRouter);
app.use("/auth", authRouter);

app.use("/health", (req, res) => {
  res.status(200).send("OK");
});

// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).json({ error: "Internal server error" });
// });

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

export default app;
