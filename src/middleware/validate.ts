import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

type ParsedRequest = {
  body?: unknown;
  params?: Request["params"];
  query?: Request["query"];
};

export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query
    }) as ParsedRequest;

    req.body = parsed.body ?? req.body;
    req.params = parsed.params ?? req.params;
    if (parsed.query) Object.assign(req.query, parsed.query);
    next();
  };
