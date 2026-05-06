import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as userModel from "../models/user.model.js";
import * as authModel from "../models/auth.model.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const register = catchAsync(async (req, res, next) => {
  const { email, first_name, last_name, password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return next(new AppError("Passwords do not match", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await userModel.create({
    email,
    first_name,
    last_name,
    password: hashedPassword,
    role: "user",
  });

  res.status(201).json({
    status: "success",
    data: {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await authModel.getByEmail(email);
  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  const iPasswordMatch = await bcrypt.compare(password, user.password);
  if (!iPasswordMatch) {
    return next(new AppError("Invalid email or password", 401));
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );
  req.user = user;

  res.status(200).json({
    status: "success",
    data: {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      token,
    },
  });
});

export const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return next(new AppError("Unauthorized", 401));
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(new AppError("Invalid or expired token", 401));
    req.user = user;
    next();
  });
});

// Role-only check — no resource fetch needed
export const restrictTo = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You don't have permission", 403));
    }
    next();
  };
};

// Allow if user has a privileged role OR is the resource owner.
// ownerField supports dot-notation for nested objects (e.g. "author_info.id")
export const restrictToOwnerOrRoles = (
  Model,
  roles = [],
  ownerField = "id",
) => {
  return async (req, _res, next) => {
    const resource = await Model.getById(req.params.id);
    if (!resource) return next(new AppError("Resource not found", 404));

    if (roles.includes(req.user.role)) return next();

    const ownerId = ownerField
      .split(".")
      .reduce((obj, key) => obj?.[key], resource);

    console.log("Owner ID:", ownerId, "User ID:", req.user.id); // Debugging line

    if (ownerId !== req.user.id) {
      return next(new AppError("You don't have permission", 403));
    }
    next();
  };
};
