import { AppError } from "../utils/appError.js";

const handleDBError = (err) => {
  console.log(err);
  if (err.code === "23505")
    return new AppError(`This value already exists. ${err.constraint}`, 409);
  if (err.code === "23503")
    return new AppError("Related resource not found.", 404);
  if (err.code === "23502")
    return new AppError(`Missing required field: ${err.column}`, 400);
  if (err.code === "22P02") return new AppError("Invalid ID format.", 400);
  return new AppError("Database error.", 500);
};

export const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  if (err.code && err.code.match(/^[0-9A-Z]{5}$/)) {
    error = handleDBError(err);
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : "Internal Server Error";

  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({ message, stack: err.stack });
  }

  res.status(statusCode).json({ message });
};
