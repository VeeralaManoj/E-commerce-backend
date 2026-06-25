import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { User } from "../src/models/user.model.js";

const testMongoUri =
  process.env.TEST_MONGO_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce_test";

const validUser = {
  name: "Test User",
  email: "test@example.com",
  phone: "9876543210",
  password: "Password123!"
};

beforeAll(async () => {
  await mongoose.connect(testMongoUri, { serverSelectionTimeoutMS: 5000 });
});

beforeEach(async () => {
  await User.deleteMany();
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await User.deleteMany();
  }
  await mongoose.disconnect();
});

describe("auth API", () => {
  it("registers a user and stores a hashed refresh token", async () => {
    const res = await request(app).post("/api/auth/register").send(validUser).expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.password).toBeUndefined();

    const user = await User.findOne({ email: validUser.email }).select("+password +refreshToken");
    expect(user?.password).not.toBe(validUser.password);
    expect(user?.refreshToken).toBeTruthy();
    expect(user?.refreshToken).not.toBe(res.body.refreshToken);
  });

  it("prevents duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send(validUser).expect(201);

    const res = await request(app).post("/api/auth/register").send(validUser).expect(409);
    expect(res.body.message).toBe("Email is already registered");
  });

  it("logs in, returns /me, rotates refresh token, and rejects the old refresh token", async () => {
    await request(app).post("/api/auth/register").send(validUser).expect(201);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: validUser.password })
      .expect(200);

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .expect(200);

    expect(meRes.body.user.email).toBe(validUser.email);

    const refreshRes = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: loginRes.body.refreshToken })
      .expect(200);

    expect(refreshRes.body.refreshToken).not.toBe(loginRes.body.refreshToken);

    await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: loginRes.body.refreshToken })
      .expect(401);
  });

  it("logs out and invalidates the current refresh token", async () => {
    const loginRes = await request(app).post("/api/auth/register").send(validUser).expect(201);

    await request(app)
      .post("/api/auth/logout")
      .set("Cookie", [`refreshToken=${loginRes.body.refreshToken}`])
      .expect(200);

    await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: loginRes.body.refreshToken })
      .expect(401);
  });

  it("supports forgot password, reset password, and change password", async () => {
    const registerRes = await request(app).post("/api/auth/register").send(validUser).expect(201);

    const forgotRes = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: validUser.email })
      .expect(200);

    await request(app)
      .post("/api/auth/reset-password")
      .send({ token: forgotRes.body.resetToken, password: "NewPassword123!" })
      .expect(200);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "NewPassword123!" })
      .expect(200);

    await request(app)
      .post("/api/auth/change-password")
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({ currentPassword: "NewPassword123!", newPassword: "FinalPassword123!" })
      .expect(200);

    await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: registerRes.body.refreshToken })
      .expect(401);
  });
});
