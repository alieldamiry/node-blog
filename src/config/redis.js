// src/config/redis.js
import Redis from "ioredis";
import { logger } from "../utils/logger.js";

console.log({host: process.env.REDIS_HOST, port: process.env.REDIS_PORT});

export const redisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
};

export const redisConnection = new Redis(redisOptions);

redisConnection.on("connect", () => logger.info("✅ Redis connected"));
redisConnection.on("error", (err) => logger.error("Redis error:", err));

// Dedicated connection for BullMQ Workers — required by BullMQ's blocking commands
export const workerConnection = new Redis({
  ...redisOptions,
  maxRetriesPerRequest: null,
});

export default redisConnection;