require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 4000;

connectDB();

const server = app.listen(PORT, () => {
  logger.info(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received. Closing server...`);
  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Global error handlers
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception 💥", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection 💥", err);
  server.close(() => process.exit(1));
});
