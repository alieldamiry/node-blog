// src/config/redis.js
import Redis from "ioredis";
import { logger } from "../utils/logger.js";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
});

redis.on("connect", () => logger.info("✅ Redis connected"));
redis.on("error", (err) => logger.error("Redis error:", err));

export default redis;
