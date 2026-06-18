import type { Request, Response } from "express";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { AppError } from "../utils/app-error.js";
import { priceItems } from "../services/pricing.service.js";

const getOrCreateCart = async (userId: string) => {
  const cart = await Cart.findOne({ user: userId });
  return cart || Cart.create({ user: userId, items: [] });
};

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  await cart.populate("items.product", "name slug images price stock");
  res.json({ success: true, cart });
});

export const addCartItem = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.body.productId);
  if (!product || !product.isActive) throw new AppError("Product not found", 404);
  if (product.stock < req.body.quantity) throw new AppError("Insufficient stock", 400);

  const cart = await getOrCreateCart(req.user!.id);
  const existing = cart.items.find((item) => item.product.toString() === product.id);

  if (existing) {
    existing.quantity = req.body.quantity;
    existing.price = product.price;
  } else {
    cart.items.push({ product: product._id, quantity: req.body.quantity, price: product.price });
  }

  await cart.save();
  await cart.populate("items.product", "name slug images price stock");
  res.json({ success: true, cart });
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
  await cart.save();
  await cart.populate("items.product", "name slug images price stock");
  res.json({ success: true, cart });
});

export const syncCart = asyncHandler(async (req: Request, res: Response) => {
  const priced = await priceItems(req.body.items);
  const cart = await getOrCreateCart(req.user!.id);
  cart.items = priced.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.price
  }));
  await cart.save();
  await cart.populate("items.product", "name slug images price stock");
  res.json({ success: true, cart });
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  cart.items = [];
  await cart.save();
  res.json({ success: true, cart });
});
