import type { Request, Response } from "express";
import Stripe from "stripe";
import { env } from "../config/env.js";
import { Cart } from "../models/cart.model.js";
import { Order } from "../models/order.model.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { AppError } from "../utils/app-error.js";
import { calculateTotals, priceItems } from "../services/pricing.service.js";

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const pricedItems = await priceItems(req.body.items);
  const totals = calculateTotals(pricedItems);

  const order = await Order.create({
    user: req.user!.id,
    items: pricedItems.map(({ product, quantity, price }) => ({
      product: product._id,
      name: product.name,
      image: product.images[0],
      quantity,
      price
    })),
    shippingAddress: req.body.shippingAddress,
    paymentMethod: req.body.paymentMethod,
    ...totals
  });

  let clientSecret: string | undefined;

  if (req.body.paymentMethod === "stripe") {
    if (!stripe) throw new AppError("Stripe is not configured", 500);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totals.totalPrice * 100),
      currency: "usd",
      metadata: { orderId: order.id, userId: req.user!.id }
    });
    order.paymentIntentId = paymentIntent.id;
    await order.save();
    clientSecret = paymentIntent.client_secret || undefined;
  }

  await Cart.findOneAndUpdate({ user: req.user!.id }, { items: [] });

  res.status(201).json({ success: true, order, clientSecret });
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user!.id }).sort("-createdAt");
  res.json({ success: true, orders });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) throw new AppError("Order not found", 404);
  if (req.user!.role !== "ADMIN" && order.user._id.toString() !== req.user!.id) {
    throw new AppError("Forbidden", 403);
  }
  res.json({ success: true, order });
});

export const listOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await Order.find().populate("user", "name email").sort("-createdAt");
  res.json({ success: true, orders });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError("Order not found", 404);

  order.status = req.body.status;
  if (req.body.status === "paid") order.paidAt = new Date();
  if (req.body.status === "delivered") order.deliveredAt = new Date();
  await order.save();

  res.json({ success: true, order });
});

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    throw new AppError("Stripe webhook is not configured", 500);
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || Array.isArray(signature)) throw new AppError("Missing Stripe signature", 400);

  const event = stripe.webhooks.constructEvent(
    req.body,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    await Order.findOneAndUpdate(
      { paymentIntentId: intent.id },
      { status: "paid", paidAt: new Date() },
      { new: true }
    );
  }

  res.json({ received: true });
});
