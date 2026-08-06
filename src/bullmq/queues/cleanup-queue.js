import { Queue } from "bullmq";
import { redisOptions } from "../../config/redis.js";

export const cleanupQueue = new Queue("cleanup-queue", {
  connection: redisOptions,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});