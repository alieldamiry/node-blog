import "dotenv/config";
import { initDb } from "./config/db.js";
import { app } from "./app.js";
import { logger } from "./utils/logger.js";

const PORT = process.env.PORT;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Failed to initialize database:", err);
    process.exit(1);
  });

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err.message);
  process.exit(1); // let your process manager restart the app
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err.message);
  process.exit(1);
});
