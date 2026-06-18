import crypto from "crypto";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { AppError } from "../utils/app-error.js";
import { signToken } from "../utils/jwt.js";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: env.JWT_COOKIE_EXPIRES_DAYS * 24 * 60 * 60 * 1000
};

const sendAuth = (res: Response, user: any, statusCode = 200) => {
  const token = signToken(user.id);
  user.password = undefined;
  res.cookie("token", token, cookieOptions).status(statusCode).json({
    success: true,
    token,
    user
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.create(req.body);
  sendAuth(res, user, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  sendAuth(res, user);
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("token").json({ success: true, message: "Logged out" });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, user: req.user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.user!.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({ success: true, user });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new AppError("No account found for that email", 404);

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: "Password reset token generated",
    resetToken: env.NODE_ENV === "development" ? resetToken : undefined
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token;
  if (!token || Array.isArray(token)) throw new AppError("Reset token is required", 400);

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) throw new AppError("Reset token is invalid or expired", 400);

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendAuth(res, user);
});
