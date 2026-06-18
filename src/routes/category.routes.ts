import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory
} from "../controllers/category.controller.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { categorySchema, updateCategorySchema } from "../schemas/category.schema.js";

export const categoryRoutes = Router();

categoryRoutes.get("/", listCategories);
categoryRoutes.get("/:slug", getCategory);
categoryRoutes.post("/", protect, adminOnly, validate(categorySchema), createCategory);
categoryRoutes.patch("/:id", protect, adminOnly, validate(updateCategorySchema), updateCategory);
categoryRoutes.delete("/:id", protect, adminOnly, deleteCategory);
