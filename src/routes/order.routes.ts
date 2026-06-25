import { Router } from "express";
import {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus
} from "../controllers/order.controller.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createOrderSchema, updateOrderStatusSchema } from "../schemas/order.schema.js";

export const orderRoutes = Router();

orderRoutes.use(protect);
orderRoutes.post("/", validate(createOrderSchema), createOrder);
orderRoutes.get("/", adminOnly, listOrders);
orderRoutes.get("/:id", getOrder);
orderRoutes.patch("/:id/status", adminOnly, validate(updateOrderStatusSchema), updateOrderStatus);
