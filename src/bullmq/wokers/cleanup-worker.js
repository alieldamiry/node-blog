import { Worker } from "bullmq";
import { logger } from "../../utils/logger.js";
import { pool } from "../../config/db.js";

const connection = { host: "localhost", port: 6379 };

const worker = new Worker(
  "cleanup-queue",
  async (job) => {
    logger.info("🧹 Starting cleanup job");
    
    job.updateProgress(0);
    
    // Delete unpublished posts older than 30 days
    const sixtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await pool.query(
      `DELETE FROM posts 
       WHERE is_published = false 
       AND created_at < $1`,
      [sixtyDaysAgo]
    );
    
    job.updateProgress(100);
    
    const deletedCount = result.rowCount;
    logger.info(
      { deletedCount, timestamp: new Date().toISOString() },
      "✅ Cleanup completed"
    );
    
    return { deletedPosts: deletedCount };
  },
  { connection }
);

worker.on("completed", (job) =>
  logger.info({ jobId: job.id, result: job.returnvalue }, "Cleanup job completed")
);

worker.on("failed", (job, err) =>
  logger.error(
    { jobId: job.id, err: err.message },
    "❌ Cleanup job failed"
  )
);

worker.on("progress", (job, progress) =>
  logger.info({ jobId: job.id, progress }, "Cleanup progress")
);