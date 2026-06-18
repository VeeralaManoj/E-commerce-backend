import type { Request, Response } from "express";
import slugify from "slugify";
import { Category } from "../models/category.model.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { AppError } from "../utils/app-error.js";

const toSlug = (name: string) => slugify(name, { lower: true, strict: true });

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().sort("name");
  res.json({ success: true, categories });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) throw new AppError("Category not found", 404);
  res.json({ success: true, category });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.create({ ...req.body, slug: toSlug(req.body.name) });
  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const payload = { ...req.body };
  if (payload.name) payload.slug = toSlug(payload.name);
  const category = await Category.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });
  if (!category) throw new AppError("Category not found", 404);
  res.json({ success: true, category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new AppError("Category not found", 404);
  res.status(204).send();
});
