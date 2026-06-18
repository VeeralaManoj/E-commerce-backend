import { Router } from "express";
import { deleteUser, listUsers, updateUserRole } from "../controllers/user.controller.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { updateUserRoleSchema } from "../schemas/user.schema.js";

export const userRoutes = Router();

userRoutes.use(protect, adminOnly);
userRoutes.get("/", listUsers);
userRoutes.patch("/:id/role", validate(updateUserRoleSchema), updateUserRole);
userRoutes.delete("/:id", deleteUser);
