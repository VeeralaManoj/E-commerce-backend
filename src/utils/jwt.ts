import jwt, { type SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";

export const signAccessToken = (userId: string) =>
  jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN
  } as SignOptions);

export const signRefreshToken = (userId: string) =>
  jwt.sign({ sub: userId, type: "refresh", jti: crypto.randomUUID() }, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN
  } as SignOptions);

export const signToken = signAccessToken;

export const verifyToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as { sub: string; iat: number; exp: number };

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as {
    sub: string;
    type?: string;
    iat: number;
    exp: number;
  };
