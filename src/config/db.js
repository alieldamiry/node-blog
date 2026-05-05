import "dotenv/config";
import { prisma } from "../lib/prisma.js";

export const testDb = async () => {
  try {
    await prisma.$connect();
    console.log("Database connection successful");
  } catch (err) {
    throw new Error(`Database connection failed: ${err.message}`);
  }
};
