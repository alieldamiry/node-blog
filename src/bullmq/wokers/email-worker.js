import { Worker } from "bullmq";
import { logger } from "../../utils/logger.js";
import { sendEmail } from "../../utils/email.js";

const connection = { host: "localhost", port: 6379 };

const worker = new Worker(
  "email-queue",
  async (job) => {
    logger.info({ job }, "execting email job ");
    // console.log(`sending an email... Processing: ${job}`);
    if (job.name === "welcome") {
      await sendEmail({
        to: job.data.email,
        subject: "Welcome to the Blog!",
        html: "<p>Hi, thanks for signing up!</p>",
      });
    } else if (job.name === "follow-up") {
      // if (job.name === "follow-up") {
      //   throw new Error("Simulated failure");
      // }
      await sendEmail({
        to: job.data.email,
        subject: "Reminder!",
        html: `<p>Hi ${job.data.name}, you haven't posted yet!</p>`,
      });
    }
  },
  { connection },
);

worker.on("completed", (job) =>
  logger.info({ jobId: job.id }, `email worker Done`),
);

worker.on("failed", (job, err) =>
  logger.error(
    { jobId: job.id, jobName: job.name, data: job.data, err: err.message },
    "Job failed",
  ),
);
