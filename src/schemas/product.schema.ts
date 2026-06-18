import { z } from "zod";

const productBody = z.object({
  name: z.string().min(2).max(160),
  description: z.string().min(10),
  brand: z.string().max(80).optional(),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional(),
  category: z.string().min(1),
  images: z.array(z.url()).min(1),
  stock: z.coerce.number().int().min(0),
  sku: z.string().max(80).optional(),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional()
});

export const createProductSchema = z.object({ body: productBody });
export const updateProductSchema = z.object({ body: productBody.partial() });

export const reviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().min(3).max(1000)
  })
});
