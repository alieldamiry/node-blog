import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { truncateAll } from "./setup.js";
import {
  createAdminAndGetToken,
  createUserInDb,
  adminData,
} from "./tests-utils.js";

beforeEach(async () => {
  await truncateAll();
});

describe("GET /api/v1/posts", () => {
  it("returns posts with success status", async () => {
    const res = await request(app).get("/api/v1/posts");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("POST /api/v1/posts", () => {
  it("requires authentication", async () => {
    const res = await request(app).post("/api/v1/posts").send({
      title: "Test Post",
      content: "This is a test post.",
    });
    expect(res.status).toBe(401);
  });

  it("creates a post with valid data and authentication", async () => {
    // First, create a user and get a token
    await createUserInDb({
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      password: "1234",
      role: "user",
    });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "test@example.com",
      password: "1234",
    });
    const token = loginRes.body.data.token;

    // Now create a post
    const res = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Post",
        content: "This is a test post.",
        is_published: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("title", "Test Post");
    expect(res.body.data).toHaveProperty("content", "This is a test post.");
    expect(res.body.data).toHaveProperty("is_published", true);
  });
});

describe("GET /api/v1/posts/me", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/v1/posts/me");
    expect(res.status).toBe(401);
  });

  it("return posts written by the logged in user", async () => {
    const token = await createAdminAndGetToken();

    await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "My Post", content: "Hello world", is_published: true });

    const res = await request(app)
      .get("/api/v1/posts/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].author).toBe(
      `${adminData.first_name} ${adminData.last_name}`,
    );
  });
});
