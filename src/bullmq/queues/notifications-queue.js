import { Queue } from "bullmq";

const connection = { host: "localhost", port: 6379 };

export const notificationQueue = new Queue("notification-queue", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000, // 1st retry after 2s, 2nd after 4s, 3rd after 8s
    },
    removeOnComplete: 5,
    removeOnFail: 5,
    // removeOnComplete: 100,
    // removeOnFail: 50,
  },
});
