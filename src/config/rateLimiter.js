import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "./redis.js";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: new RedisStore({
    sendCommand: (...args) => {
      return redis.call(...args);
    },
  }),
});
