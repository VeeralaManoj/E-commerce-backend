import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { openApiDocument } from "./config/openapi.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import { sanitizeInput } from "./middleware/sanitize.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { cartRoutes } from "./routes/cart.routes.js";
import { categoryRoutes } from "./routes/category.routes.js";
import { orderRoutes } from "./routes/order.routes.js";
import { productRoutes } from "./routes/product.routes.js";
import { userRoutes } from "./routes/user.routes.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false
  })
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);

app.get("/", (_req, res) => {
  res.json({ success: true, message: "Server is up and running" });
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "API is healthy" });
});

app.get("/api/docs.json", (_req, res) => {
  res.json(openApiDocument);
});

app.get("/api/docs", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
  <head><title>Ecommerce API Docs</title><link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"></head>
  <body><div id="swagger-ui"></div><script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script><script>SwaggerUIBundle({ url: "/api/docs.json", dom_id: "#swagger-ui" })</script></body>
</html>`);
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/users", userRoutes);

app.use(notFound);
app.use(errorHandler);
