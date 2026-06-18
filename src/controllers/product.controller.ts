import type { Request, Response } from "express";
import slugify from "slugify";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { AppError } from "../utils/app-error.js";
import { buildRegexFilter, getPagination, parseSort } from "../utils/query.js";

const toSlug = (name: string) => slugify(name, { lower: true, strict: true });

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination({
    page: Number(req.query.page),
    limit: Number(req.query.limit)
  });
  const filter: Record<string, unknown> = { isActive: true };

  Object.assign(filter, buildRegexFilter(req.query.search, ["name", "description", "brand"]));
  if (req.query.category) filter.category = req.query.category;
  if (req.query.featured === "true") filter.isFeatured = true;
  if (req.query.minPrice) filter.price = { ...(filter.price as object), $gte: Number(req.query.minPrice) };
  if (req.query.maxPrice) filter.price = { ...(filter.price as object), $lte: Number(req.query.maxPrice) };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(parseSort(String(req.query.sort || "")))
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter)
  ]);

  res.json({
    success: true,
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate("category", "name slug")
    .populate("reviews.user", "name avatar");
  if (!product) throw new AppError("Product not found", 404);

  const related = await Product.find({
    _id: { $ne: product.id },
    category: product.category,
    isActive: true
  }).limit(4);

  res.json({ success: true, product, related });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.create({ ...req.body, slug: toSlug(req.body.name) });
  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const payload = { ...req.body };
  if (payload.name) payload.slug = toSlug(payload.name);
  const product = await Product.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });
  if (!product) throw new AppError("Product not found", 404);
  res.json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError("Product not found", 404);
  res.status(204).send();
});

export const addReview = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError("Product not found", 404);

  const existing = product.reviews.find((review) => review.user.toString() === req.user!.id);
  if (existing) throw new AppError("You already reviewed this product", 409);

  product.reviews.push({
    user: req.user!._id,
    name: req.user!.name,
    rating: req.body.rating,
    comment: req.body.comment
  });
  product.reviewCount = product.reviews.length;
  product.rating =
    product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviewCount;
  await product.save();

  res.status(201).json({ success: true, product });
});
