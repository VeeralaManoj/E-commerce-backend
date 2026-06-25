export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Ecommerce Backend API",
    version: "1.0.0"
  },
  servers: [{ url: "/api" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      cookieAuth: { type: "apiKey", in: "cookie", name: "accessToken" }
    }
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "phone", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  phone: { type: "string" },
                  password: { type: "string", format: "password" },
                  role: { type: "string", enum: ["CUSTOMER", "SELLER", "ADMIN"] }
                }
              }
            }
          }
        },
        responses: { "201": { description: "Registered" }, "409": { description: "Duplicate email" } }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", format: "password" }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Authenticated" }, "401": { description: "Invalid credentials" } }
      }
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout and invalidate refresh token",
        responses: { "200": { description: "Logged out" } }
      }
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Rotate refresh token and return a fresh access token",
        responses: { "200": { description: "Refreshed" }, "401": { description: "Invalid refresh token" } }
      }
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Generate a password reset token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string", format: "email" } }
              }
            }
          }
        },
        responses: { "200": { description: "Reset token generated" }, "404": { description: "User not found" } }
      }
    },
    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password using a reset token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token", "password"],
                properties: {
                  token: { type: "string" },
                  password: { type: "string", format: "password" }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Password reset" }, "400": { description: "Invalid token" } }
      }
    },
    "/auth/change-password": {
      post: {
        tags: ["Auth"],
        summary: "Change the current user's password",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: { type: "string", format: "password" },
                  newPassword: { type: "string", format: "password" }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Password changed" }, "401": { description: "Unauthorized" } }
      }
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get the current logged-in user",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { "200": { description: "Current user" }, "401": { description: "Unauthorized" } }
      }
    }
  }
};
