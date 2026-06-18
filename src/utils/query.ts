import type { Query } from "mongoose";

type PaginationOptions = {
  page?: number;
  limit?: number;
};

export const getPagination = ({ page = 1, limit = 12 }: PaginationOptions) => {
  const normalizedPage = Math.max(Number(page) || 1, 1);
  const normalizedLimit = Math.min(Math.max(Number(limit) || 12, 1), 100);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit
  };
};

export const parseSort = (sort?: string) => {
  const allowed: Record<string, string> = {
    newest: "-createdAt",
    oldest: "createdAt",
    "price-asc": "price",
    "price-desc": "-price",
    rating: "-rating",
    name: "name"
  };

  return allowed[sort || ""] || "-createdAt";
};

export const buildRegexFilter = <T>(
  value: unknown,
  fields: Array<keyof T>
): Record<string, unknown> => {
  if (!value || typeof value !== "string") return {};
  const regex = new RegExp(value.trim(), "i");
  return { $or: fields.map((field) => ({ [field]: regex })) };
};

export type MongooseQuery<T> = Query<T, T>;
