import { cleanupQueue } from "../bullmq/queues/cleanup-queue.js";
import { emailQueue } from "../bullmq/queues/email-queue.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getJobsStats = catchAsync(async (req, res) => {
  const [emailCounts, cleanupCounts] = await Promise.all([
    emailQueue.getJobCounts(),
    cleanupQueue.getJobCounts(),
  ]);

  // Get failed jobs for debugging
  const failedEmailJobs = await emailQueue.getFailed(0, 5);
  const failedCleanupJobs = await cleanupQueue.getFailed(0, 5);

  res.json({
    email: emailCounts,
    cleanup: cleanupCounts,
    recentFailures: {
      email: failedEmailJobs.map((job) => ({
        id: job.id,
        name: job.name,
        failedReason: job.failedReason,
        timestamp: job.finishedOn,
      })),
      cleanup: failedCleanupJobs.map((job) => ({
        id: job.id,
        failedReason: job.failedReason,
        timestamp: job.finishedOn,
      })),
    },
  });
});
