import { Router } from "express";
import { dashboardStats } from "../controllers/admin.controller.js";
import { adminOnly, protect } from "../middleware/auth.js";

export const adminRoutes = Router();

adminRoutes.use(protect, adminOnly);
adminRoutes.get("/stats", dashboardStats);
