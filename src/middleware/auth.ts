import type { NextFunction, Request, Response } from "express";
import { USER_ROLES, type UserRole } from "../constants/roles.js";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/app-error.js";
import { verifyToken } from "../utils/jwt.js";
import { asyncHandler } from "./async-handler.js";

export const authenticateUser = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const bearerToken = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const token = bearerToken || req.cookies?.accessToken || req.cookies?.token;

  if (!token) throw new AppError("Authentication required", 401);

  const payload = verifyToken(token);
  const user = await User.findById(payload.sub);

  if (!user) throw new AppError("User no longer exists", 401);

  req.user = user;
  next();
});

export const authorizeRoles =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError("Authentication required", 401);
    if (!roles.includes(req.user.role)) throw new AppError("Forbidden", 403);
    next();
  };

export const protect = authenticateUser;
export const restrictTo = authorizeRoles;
export const adminOnly = authorizeRoles("ADMIN");

export const roles = USER_ROLES;
