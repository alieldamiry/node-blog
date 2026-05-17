import { AppError } from "../utils/appError.js";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";

const handleDBError = (err) => {
  if (err.code === "23505")
    return new AppError(`This value already exists. ${err.constraint}`, 409);
  if (err.code === "23503")
    return new AppError("Related resource not found.", 404);
  if (err.code === "23502")
    return new AppError(`Missing required field: ${err.column}`, 400);
  if (err.code === "22P02") return new AppError("Invalid ID format.", 400);
  return new AppError("Database error.", 500);
};

const handleZodError = (err) => {
  const error = new AppError("Validation failed", 422);
  error.errors = err.issues.map((issue) => ({
    field: issue.path.slice(1).join("."),
    message: issue.message,
  }));
  error.isOperational = true;
  return error;
};

export const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  if (err.name === "ZodError") {
    error = handleZodError(err);
  }

  if (err.code && err.code.match(/^[0-9A-Z]{5}$/)) {
    error = handleDBError(err);
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : "Internal Server Error";

  const response = { status: "fail", message };
  if (error.errors) response.errors = error.errors;

  if (process.env.NODE_ENV !== "test") {
    logger.error({ err }, "logging error");
  }

  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({ ...response, stack: err.stack });
  }

  res.status(statusCode).json(response);
};
