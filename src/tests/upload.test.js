import { vi, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createAdminAndGetToken } from "./tests-utils";
import app from "../app";
import { truncateAll } from "./setup";
import { deleteFromCloudinary } from "../lib/cloudinary";

vi.mock("../lib/cloudinary", () => ({
  uploadToCloudinary: vi.fn().mockResolvedValue({
    url: "http://fake.com/img.jpg",
    publicId: "fake_public_id",
  }),
  deleteFromCloudinary: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(async () => {
  await truncateAll();
});

describe("/api/v1/auth/me/avatar", () => {
  it("uploads an avatar successfully", async () => {
    const token = await createAdminAndGetToken();

    const res = await request(app)
      .post("/api/v1/auth/me/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", "tests/fixtures/avatar.jpg");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("url", "http://fake.com/img.jpg");
  });

  it("fails with status code 400 when wrong file type is uploaded", async () => {
    const token = await createAdminAndGetToken();

    const res = await request(app)
      .post("/api/v1/auth/me/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", "tests/fixtures/note.txt");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("fails with status code 400 when file larger than 5mb uploaded ", async () => {
    const token = await createAdminAndGetToken();

    const res = await request(app)
      .post("/api/v1/auth/me/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", "tests/fixtures/7mb.jpg");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("fails with status code 400 when no file uploaded ", async () => {
    const token = await createAdminAndGetToken();

    const res = await request(app)
      .post("/api/v1/auth/me/avatar")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("deleting previous file when uploading file the second time ", async () => {
    const token = await createAdminAndGetToken();

    await request(app)
      .post("/api/v1/auth/me/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", "tests/fixtures/avatar.jpg");

    await request(app)
      .post("/api/v1/auth/me/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", "tests/fixtures/avatar.jpg");

    expect(deleteFromCloudinary).toHaveBeenCalledOnce();
  });
});
