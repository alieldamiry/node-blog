import { Worker } from "bullmq";
import { logger } from "../../utils/logger.js";
import { sendEmail } from "../../utils/email.js";
import { workerConnection } from "../../config/redis.js";

const worker = new Worker(
  "email-queue",
  async (job) => {
    logger.info({ job }, "executing email job");

    job.updateProgress(0);

    if (job.name === "welcome") {
      await sendEmail({
        to: job.data.email,
        subject: "Welcome to the Blog!",
        html: "<p>Hi, thanks for signing up!</p>",
      });
    } else if (job.name === "follow-up") {
      await sendEmail({
        to: job.data.email,
        subject: "Reminder!",
        html: `<p>Hi ${job.data.name}, you haven't posted yet!</p>`,
      });
    }

    job.updateProgress(100);

    return { sent: true };
  },
  { connection: workerConnection },
);

// Progress tracking logs
worker.on("progress", (job, progress) =>
  logger.info({ jobId: job.id, progress }, "Email job progress"),
);

worker.on("completed", (job) =>
  logger.info(
    { jobId: job.id, result: job.returnvalue },
    `email job completed`,
  ),
);

worker.on("failed", (job, err) =>
  logger.error(
    { jobId: job.id, jobName: job.name, data: job.data, err: err.message },
    "Job failed",
  ),
);
