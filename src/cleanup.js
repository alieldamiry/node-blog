import { cleanupQueue } from "./bullmq/queues/cleanup-queue.js";
import { logger } from "./utils/logger.js";

async function scheduleCleanupJob() {
  try {
    // Remove all existing cleanup jobs and schedulers from Redis
    await cleanupQueue.obliterate({ force: true });
    
    const repeatConfig = process.env.NODE_ENV === "production"
      ? { cron: "0 2 * * *" } // 2 AM daily in prod
      : { every: 80 * 1000 };  // Every 80 seconds in dev
    
    await cleanupQueue.add(
      "delete-old-drafts",
      {},
      {
        repeat: repeatConfig,
        removeOnComplete: false,  // Keep job history
        removeOnFail: false
      }
    );
    
    logger.info("📅 Cleanup job scheduled (fresh)");
  } catch (error) {
    logger.error({ err: error.message }, "Failed to schedule cleanup job");
  }
}

await scheduleCleanupJob();