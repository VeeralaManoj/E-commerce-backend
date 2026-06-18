import type { Request, Response } from "express";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../middleware/async-handler.js";

export const dashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [orders, users, products, revenue] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments(),
    Product.countDocuments(),
    Order.aggregate([
      { $match: { status: { $in: ["paid", "processing", "shipped", "delivered"] } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ])
  ]);

  const recentOrders = await Order.find().populate("user", "name email").sort("-createdAt").limit(6);

  res.json({
    success: true,
    stats: {
      orders,
      users,
      products,
      revenue: revenue[0]?.total || 0
    },
    recentOrders
  });
});
