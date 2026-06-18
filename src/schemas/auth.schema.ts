import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.email(),
    password: z.string().min(8)
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(1)
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email: z.email() })
});

export const resetPasswordSchema = z.object({
  params: z.object({ token: z.string().min(20) }),
  body: z.object({ password: z.string().min(8) })
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    phone: z.string().max(30).optional(),
    avatar: z.url().optional()
  })
});
