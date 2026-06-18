import { Router } from "express";
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  syncCart
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { cartItemSchema, syncCartSchema } from "../schemas/cart.schema.js";

export const cartRoutes = Router();

cartRoutes.use(protect);
cartRoutes.get("/", getCart);
cartRoutes.post("/items", validate(cartItemSchema), addCartItem);
cartRoutes.post("/sync", validate(syncCartSchema), syncCart);
cartRoutes.delete("/items/:productId", removeCartItem);
cartRoutes.delete("/", clearCart);
