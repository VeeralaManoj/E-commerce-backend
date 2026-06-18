import { z } from "zod";

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    description: z.string().max(500).optional(),
    image: z.url().optional(),
    isActive: z.boolean().optional()
  })
});

export const updateCategorySchema = z.object({
  body: categorySchema.shape.body.partial()
});
