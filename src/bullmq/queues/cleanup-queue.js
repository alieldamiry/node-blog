import { Queue } from "bullmq";

const connection = { host: "localhost", port: 6379 };

export const cleanupQueue = new Queue("cleanup-queue", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});