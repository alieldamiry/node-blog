import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { truncateAll } from "./setup.js";
import { createAdminAndGetToken, getUserIdByEmail, userData } from "./tests-utils.js";

beforeEach(async () => {
  await truncateAll();
});

describe("GET /users", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/users");
    expect(res.status).toBe(401);
  });

  it("requires admin role", async () => {
    await request(app).post("/auth/register").send(userData);
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: userData.email, password: userData.password });
    const token = loginRes.body.data.token;

    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("returns users with success status", async () => {
    const token = await createAdminAndGetToken();

    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("returns users with correct fields", async () => {
    const adminToken = await createAdminAndGetToken();

    await request(app).post("/auth/register").send(userData);

    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);

    const user = res.body.data.find((u) => u.email === userData.email);
    expect(user).toBeDefined();
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email", userData.email);
    expect(user).toHaveProperty("first_name", userData.first_name);
    expect(user).toHaveProperty("last_name", userData.last_name);
    expect(user).toHaveProperty("role");
    expect(user).toHaveProperty("is_verified");
    expect(user).toHaveProperty("created_at");
    expect(user).toHaveProperty("updated_at");
    expect(user).not.toHaveProperty("password");
  });

  it("returns users ordered by creation date descending", async () => {
    const adminToken = await createAdminAndGetToken();

    const user1 = { ...userData, email: "user1@example.com" };
    const user2 = { ...userData, email: "user2@example.com" };

    await request(app).post("/auth/register").send(user1);
    await request(app).post("/auth/register").send(user2);

    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);

    for (let i = 0; i < res.body.data.length - 1; i++) {
      const current = new Date(res.body.data[i].created_at);
      const next = new Date(res.body.data[i + 1].created_at);
      expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
    }
  });
});

describe("GET /users/activity", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/users/1");
    expect(res.status).toBe(401);
  });

  it("returns user activity with success status", async () => {
    const adminToken = await createAdminAndGetToken();

    // const user = { ...userData, email: "user@example.com" };
    // await request(app).post("/auth/register").send(user);

    const res = await request(app)
      .get(`/users/activity`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(0);
  });
});

describe("PATCH /users/:id", () => {
  it("requires authentication", async () => {
    const res = await request(app)
      .patch("/users/1")
      .send({ first_name: "Updated" });
    expect(res.status).toBe(401);
  });

  it("returns 403 when non-owner non-admin user tries to update", async () => {
    const adminToken = await createAdminAndGetToken();

    const targetUser = { ...userData, email: "target@example.com" };
    await request(app).post("/auth/register").send(targetUser);
    const targetId = await getUserIdByEmail(adminToken, targetUser.email);

    const otherUser = { ...userData, email: "other@example.com" };
    await request(app).post("/auth/register").send(otherUser);
    const otherLoginRes = await request(app)
      .post("/auth/login")
      .send({ email: otherUser.email, password: otherUser.password });
    const otherToken = otherLoginRes.body.data.token;

    const res = await request(app)
      .patch(`/users/${targetId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ first_name: "Hacked" });

    expect(res.status).toBe(403);
  });

  it("allows owner to update their own profile", async () => {
    await request(app).post("/auth/register").send(userData);
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: userData.email, password: userData.password });
    const token = loginRes.body.data.token;

    const adminToken = await createAdminAndGetToken();
    const userId = await getUserIdByEmail(adminToken, userData.email);

    const res = await request(app)
      .patch(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ first_name: "Updated", last_name: "Name" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.first_name).toBe("Updated");
    expect(res.body.data.last_name).toBe("Name");
  });

  it("allows admin to update any user", async () => {
    const adminToken = await createAdminAndGetToken();

    await request(app).post("/auth/register").send(userData);
    const userId = await getUserIdByEmail(adminToken, userData.email);

    const res = await request(app)
      .patch(`/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ first_name: "AdminUpdated" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.first_name).toBe("AdminUpdated");
  });

  it("rejects first_name shorter than 3 characters", async () => {
    const adminToken = await createAdminAndGetToken();

    await request(app).post("/auth/register").send(userData);
    const userId = await getUserIdByEmail(adminToken, userData.email);

    const res = await request(app)
      .patch(`/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ first_name: "ab" });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe("Validation failed");
  });

  it("rejects last_name shorter than 3 characters", async () => {
    const adminToken = await createAdminAndGetToken();

    await request(app).post("/auth/register").send(userData);
    const userId = await getUserIdByEmail(adminToken, userData.email);

    const res = await request(app)
      .patch(`/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ last_name: "X" });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe("Validation failed");
  });

  it("allows empty body when both fields are optional", async () => {
    const adminToken = await createAdminAndGetToken();

    await request(app).post("/auth/register").send(userData);
    const userId = await getUserIdByEmail(adminToken, userData.email);

    const res = await request(app)
      .patch(`/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });
});
