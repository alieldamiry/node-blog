import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { truncateAll } from "./setup.js";
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

export const userData = {
  email: "testuser@example.com",
  first_name: "Test",
  last_name: "User",
  password: "1234",
  passwordConfirm: "1234",
};

export const adminData = {
  email: "testadmin@example.com",
  first_name: "Admin",
  last_name: "User",
  password: "1234",
};

export async function createUserInDb({
  email,
  first_name,
  last_name,
  password,
  role,
}) {
  await pool.query("DELETE FROM users WHERE email = $1", [email]);
  const hashedPassword = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (email, first_name, last_name, role, password)
     VALUES ($1, $2, $3, $4, $5)`,
    [email, first_name, last_name, role, hashedPassword],
  );
}

export async function createAdminAndGetToken() {
  await createUserInDb({ ...adminData, role: "admin" });

  const loginRes = await request(app).post("/auth/login").send({
    email: adminData.email,
    password: adminData.password,
  });

  if (!loginRes.body.data?.token) {
    throw new Error(
      `Failed to get admin token: ${JSON.stringify(loginRes.body)} (status: ${loginRes.status})`,
    );
  }

  return loginRes.body.data.token;
}

export async function getUserIdByEmail(adminToken, email) {
  const res = await request(app)
    .get("/users")
    .set("Authorization", `Bearer ${adminToken}`);
  const user = res.body.data.find((u) => u.email === email);
  if (!user) throw new Error(`User ${email} not found`);
  return user.id;
}
