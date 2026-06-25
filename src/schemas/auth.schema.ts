import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character");

export const registerSchema = z.object({
  body: z.object({
    name: z.string({ error: "Name is required" }).min(2).max(80),
    email: z.email({ error: "A valid email is required" }),
    phone: z.string({ error: "Phone is required" }).min(7).max(30),
    password: passwordSchema,
    role: z.enum(["CUSTOMER", "SELLER", "ADMIN"]).optional()
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
  body: z.object({
    token: z.string().min(20),
    password: passwordSchema
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    phone: z.string().max(30).optional(),
    avatar: z.url().optional()
  })
});
