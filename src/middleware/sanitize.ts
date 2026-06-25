import type { NextFunction, Request, Response } from "express";

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (!value || typeof value !== "object") return value;

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
    (clean, [key, nestedValue]) => {
      if (key.startsWith("$") || key.includes(".")) return clean;
      clean[key] = sanitizeValue(nestedValue);
      return clean;
    },
    {}
  );
};

export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) req.body = sanitizeValue(req.body);
  next();
};
