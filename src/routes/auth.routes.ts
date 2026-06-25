import { Router } from "express";
import {
  forgotPassword,
  changePassword,
  login,
  logout,
  me,
  refresh,
  register,
  resetPassword,
  updateProfile
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { loginRateLimiter } from "../middleware/rate-limit.js";
import { validate } from "../middleware/validate.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema
} from "../schemas/auth.schema.js";

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), register);
authRoutes.post("/login", loginRateLimiter, validate(loginSchema), login);
authRoutes.post("/logout", logout);
authRoutes.post("/refresh", refresh);
authRoutes.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
authRoutes.post("/reset-password", validate(resetPasswordSchema), resetPassword);
authRoutes.post("/change-password", protect, validate(changePasswordSchema), changePassword);
authRoutes.get("/me", protect, me);
authRoutes.patch("/profile", protect, validate(updateProfileSchema), updateProfile);
