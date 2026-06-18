import { z } from "zod";
import { ORDER_STATUSES } from "../constants/roles.js";

const shippingAddress = z.object({
  fullName: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().min(2),
  phone: z.string().optional()
});

export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1)
      })
    ).min(1),
    shippingAddress,
    paymentMethod: z.enum(["stripe", "cod"]).default("stripe")
  })
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(ORDER_STATUSES)
  })
});
