import crypto from "crypto";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/app-error.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { hashToken } from "../utils/token.js";

const accessCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 15 * 60 * 1000
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const publicUserFields = "-password -refreshToken -resetPasswordToken -resetPasswordExpires";

const issueTokens = async (res: Response, userId: string) => {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  await User.findByIdAndUpdate(userId, { refreshToken: hashToken(refreshToken) });

  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  return { accessToken, refreshToken };
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", accessCookieOptions);
  res.clearCookie("refreshToken", refreshCookieOptions);
  res.clearCookie("token");
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const existingUser = await User.exists({ email: req.body.email });
  if (existingUser) throw new AppError("Email is already registered", 409);

  const user = await User.create(req.body);
  const tokens = await issueTokens(res, user.id);
  const safeUser = await User.findById(user.id).select(publicUserFields);

  res.status(201).json({ success: true, ...tokens, user: safeUser });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const tokens = await issueTokens(res, user.id);
  const safeUser = await User.findById(user.id).select(publicUserFields);

  res.json({ success: true, ...tokens, user: safeUser });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    const hashedToken = hashToken(refreshToken);
    await User.findOneAndUpdate({ refreshToken: hashedToken }, { $unset: { refreshToken: "" } });
  } else if (req.user?.id) {
    await User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: "" } });
  }

  clearAuthCookies(res);
  res.json({ success: true, message: "Logged out" });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) throw new AppError("Refresh token is required", 401);

  const payload = verifyRefreshToken(token);
  if (payload.type !== "refresh") throw new AppError("Invalid refresh token", 401);

  const user = await User.findById(payload.sub).select("+refreshToken");
  if (!user?.refreshToken || user.refreshToken !== hashToken(token)) {
    throw new AppError("Refresh token is invalid or expired", 401);
  }

  const tokens = await issueTokens(res, user.id);
  const safeUser = await User.findById(user.id).select(publicUserFields);

  res.json({ success: true, ...tokens, user: safeUser });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, user: req.user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.user!.id, req.body, {
    new: true,
    runValidators: true
  }).select(publicUserFields);

  res.json({ success: true, user });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new AppError("No account found for that email", 404);

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = hashToken(resetToken);
  user.resetPasswordExpires = new Date(
    Date.now() + env.RESET_PASSWORD_EXPIRES_MINUTES * 60 * 1000
  );
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: "Password reset token generated",
    resetToken: env.NODE_ENV === "development" || env.NODE_ENV === "test" ? resetToken : undefined
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const hashedToken = hashToken(req.body.token);
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) throw new AppError("Reset token is invalid or expired", 400);

  user.password = req.body.password;
  user.refreshToken = undefined;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  const tokens = await issueTokens(res, user.id);
  const safeUser = await User.findById(user.id).select(publicUserFields);

  res.json({ success: true, ...tokens, user: safeUser });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id).select("+password");
  if (!user) throw new AppError("User no longer exists", 401);

  if (!(await user.comparePassword(req.body.currentPassword))) {
    throw new AppError("Current password is incorrect", 401);
  }

  user.password = req.body.newPassword;
  user.refreshToken = undefined;
  await user.save();

  const tokens = await issueTokens(res, user.id);
  const safeUser = await User.findById(user.id).select(publicUserFields);

  res.json({ success: true, ...tokens, user: safeUser });
});
