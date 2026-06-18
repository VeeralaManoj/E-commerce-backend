import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url().default("http://localhost:3000"),

  // Legacy modules still compile, but the minimal server no longer uses these.
  MONGO_URI: z.string().optional(),
  JWT_SECRET: z.string().default("local-development-jwt-secret"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_COOKIE_EXPIRES_DAYS: z.coerce.number().default(7),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
