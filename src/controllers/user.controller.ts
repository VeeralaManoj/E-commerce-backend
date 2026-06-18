import type { Request, Response } from "express";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { AppError } from "../utils/app-error.js";

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().sort("-createdAt");
  res.json({ success: true, users });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true, runValidators: true }
  );
  if (!user) throw new AppError("User not found", 404);
  res.json({ success: true, user });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  if (req.params.id === req.user!.id) throw new AppError("You cannot delete yourself", 400);
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError("User not found", 404);
  res.status(204).send();
});
