import { Worker } from "bullmq";
import { logger } from "../../utils/logger.js";
import { pool } from "../../config/db.js";

const connection = { host: "localhost", port: 6379 };

const worker = new Worker(
  "notification-queue",
  async (job) => {
    logger.info({ job }, "executing notification job ");
    if (job.name === "like") {
      console.log("inserting like notification");
    } else if (job.name === "post_commented") {
      console.log("inserting comment notification", job.data);
      const { postOwnerId, commentedBy } = job.data;
      await pool.query(
        `INSERT INTO notifications (user_id, type, message)
         VALUES ($1, $2, $3)`,
        [
          postOwnerId,
          "post_commented",
          `${commentedBy} commented on your post`,
        ],
      );
    }
  },
  { connection },
);

worker.on("completed", (job) =>
  logger.info({ jobId: job.id }, `notification worker Done`),
);

worker.on("failed", (job, err) =>
  logger.error(
    { jobId: job.id, jobName: job.name, data: job.data, err: err.message },
    "Job failed",
  ),
);
