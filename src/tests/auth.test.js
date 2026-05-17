import { describe, it, expect, beforeEach, expectTypeOf } from "vitest";
import request from "supertest";
import app from "../app.js";
import { truncateAll } from "./setup.js";

beforeEach(async () => {
  await truncateAll();
});

const userData = {
  email: "test@example.com",
  first_name: "Test",
  last_name: "User",
  password: "1234",
  passwordConfirm: "1234",
};

describe("POST /auth/register", () => {
  it("registers a new user with valid data", async () => {
    const res = await request(app).post("/auth/register").send(userData);
    const { data } = res.body;
    expect(res.statusCode).toBe(201);
    expect(data).toHaveProperty("role", "user");
    expect(data).toHaveProperty("email", "test@example.com");
    expect(data).toHaveProperty("first_name", "Test");
    expect(data).toHaveProperty("last_name", "User");
  });

  it("rejects registration with missing fields", async () => {
    const res = await request(app).post("/auth/register").send({
      first_name: "Test",
      last_name: "User",
    });

    expect(res.statusCode).toBe(422);
    expect(res.body.message).toBe("Validation failed");
    expectTypeOf(res.body.errors).toBeArray();
    expect(res.body.errors).toHaveLength(3);
  });

  it("rejects duplicate email", async () => {
    await request(app).post("/auth/register").send(userData);

    const res = await request(app).post("/auth/register").send(userData);

    expect(res.status).toBe(409);
  });
});

describe("POST /auth/login", () => {
  it("returns a token with valid credentials", async () => {
    await request(app).post("/auth/register").send(userData);
    const res = await request(app)
      .post("/auth/login")
      .send({ email: userData.email, password: userData.password });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data.token");
  });

  it("rejects wrong password", async () => {
    await request(app).post("/auth/register").send(userData);
    const res = await request(app)
      .post("/auth/login")
      .send({ email: userData.email, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });
});
