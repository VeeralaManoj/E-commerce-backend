import type { HydratedDocument } from "mongoose";
import type { IUser } from "../models/user.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<IUser>;
    }
  }
}

export {};
