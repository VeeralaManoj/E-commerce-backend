import { z } from "zod";

export const cartItemSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().min(1)
  })
});

export const syncCartSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1)
      })
    )
  })
});
