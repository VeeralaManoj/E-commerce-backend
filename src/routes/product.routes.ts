import { Router } from "express";
import {
  addReview,
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct
} from "../controllers/product.controller.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createProductSchema, reviewSchema, updateProductSchema } from "../schemas/product.schema.js";

export const productRoutes = Router();

productRoutes.get("/", listProducts);
productRoutes.get("/:slug", getProduct);
productRoutes.post("/", protect, adminOnly, validate(createProductSchema), createProduct);
productRoutes.patch("/:id", protect, adminOnly, validate(updateProductSchema), updateProduct);
productRoutes.delete("/:id", protect, adminOnly, deleteProduct);
productRoutes.post("/:id/reviews", protect, validate(reviewSchema), addReview);
