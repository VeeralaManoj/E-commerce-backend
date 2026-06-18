import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDatabase = async () => {
  if (!env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGO_URI);
  console.log("MongoDB connected");
};
