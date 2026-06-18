import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  me,
  register,
  resetPassword,
  updateProfile
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema
} from "../schemas/auth.schema.js";

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), register);
authRoutes.post("/login", validate(loginSchema), login);
authRoutes.post("/logout", logout);
authRoutes.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
authRoutes.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);
authRoutes.get("/me", protect, me);
authRoutes.patch("/profile", protect, validate(updateProfileSchema), updateProfile);
