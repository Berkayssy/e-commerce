// backend/config/db.js - Production-ready MongoDB connection
const mongoose = require("mongoose");
const logger = require("../utils/logger");

const MAX_RETRIES = 5;
const RETRY_DELAY = 3000; // 3 seconds
const CONNECTION_TIMEOUT = 30000; // 30 seconds

// Connection options optimized for production
// Note: Some options may vary by Mongoose version
const connectionOptions = {
  serverSelectionTimeoutMS: CONNECTION_TIMEOUT,
  socketTimeoutMS: 45000,
  // Mongoose 8+ uses different option names
  maxPoolSize: 10, // Maximum number of sockets in the connection pool
  minPoolSize: 2, // Minimum number of sockets in the connection pool
  maxIdleTimeMS: 30000, // Close sockets after 30 seconds of inactivity
  heartbeatFrequencyMS: 10000, // Check server status every 10 seconds
  retryWrites: true, // Retry write operations on transient network errors
  retryReads: true, // Retry read operations on transient network errors
};

let isConnected = false;
let connectionRetries = 0;

// Retry connection with exponential backoff
const connectWithRetry = async (mongoUri, retryCount = 0) => {
  try {
    logger.info(
      `🔗 Attempting MongoDB connection (attempt ${
        retryCount + 1
      }/${MAX_RETRIES})...`
    );

    const conn = await mongoose.connect(mongoUri, connectionOptions);

    isConnected = true;
    connectionRetries = 0;

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);
    logger.info(
      `🔌 Connection pool: ${conn.connection.maxPoolSize} max, ${conn.connection.minPoolSize} min`
    );

    return conn;
  } catch (err) {
    connectionRetries++;
    logger.error(
      `❌ MongoDB connection attempt ${retryCount + 1} failed:`,
      err.message
    );

    if (retryCount < MAX_RETRIES - 1) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      logger.warn(`⏳ Retrying MongoDB connection in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectWithRetry(mongoUri, retryCount + 1);
    } else {
      throw new Error(
        `Failed to connect to MongoDB after ${MAX_RETRIES} attempts: ${err.message}`
      );
    }
  }
};

// Check if database connection is healthy
const isDatabaseHealthy = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

// Get connection status
const getConnectionStatus = () => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    state: states[mongoose.connection.readyState],
    readyState: mongoose.connection.readyState,
    isConnected: isDatabaseHealthy(),
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    retries: connectionRetries,
  };
};

// Close database connection gracefully
const closeConnection = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      isConnected = false;
      logger.info("✅ MongoDB connection closed gracefully");
    }
  } catch (err) {
    logger.error("❌ Error closing MongoDB connection:", err);
    throw err;
  }
};

const connectDB = async () => {
  try {
    // Use MONGO_URI consistently (not MONGODB_URI)
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is required");
    }

    // Mask sensitive information in logs (password in URI)
    const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
    logger.info(`🔗 Connecting to MongoDB at ${maskedUri}`);

    // Connect with retry logic
    await connectWithRetry(mongoUri);

    // Set up event handlers
    mongoose.connection.on("error", (err) => {
      isConnected = false;
      logger.error("MongoDB connection error:", {
        error: err.message,
        stack: err.stack,
        status: getConnectionStatus(),
      });
    });

    mongoose.connection.on("disconnected", () => {
      isConnected = false;
      logger.warn("⚠️ MongoDB disconnected", {
        status: getConnectionStatus(),
      });
    });

    mongoose.connection.on("reconnected", () => {
      isConnected = true;
      logger.info("♻️ MongoDB reconnected", {
        status: getConnectionStatus(),
      });
    });

    mongoose.connection.on("connecting", () => {
      logger.info("🔄 MongoDB connecting...");
    });

    // Handle process termination
    process.on("SIGINT", async () => {
      logger.info("SIGINT received, closing MongoDB connection...");
      await closeConnection();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("SIGTERM received, closing MongoDB connection...");
      await closeConnection();
      process.exit(0);
    });

    // Production: Fail fast if database is critical
    // In production, we should not continue without database
    if (process.env.NODE_ENV === "production" && !isDatabaseHealthy()) {
      throw new Error(
        "Database connection failed. Server cannot start in production without database."
      );
    }
  } catch (err) {
    logger.error("❌ MongoDB connection failed:", err.message);

    // In production, exit if database is critical
    if (
      process.env.NODE_ENV === "production" &&
      process.env.FAIL_FAST_DB !== "false"
    ) {
      logger.error(
        "💥 Failing fast - cannot continue without database in production"
      );
      process.exit(1);
    }

    // In development/test, warn but continue (for development flexibility)
    if (process.env.NODE_ENV !== "production") {
      logger.warn(
        "⚠️ Server will continue without database connection (development mode)"
      );
      logger.warn("⚠️ API endpoints requiring database will fail");
    }

    // Re-throw if we need to handle it upstream
    throw err;
  }
};

module.exports = connectDB;
module.exports.isDatabaseHealthy = isDatabaseHealthy;
module.exports.getConnectionStatus = getConnectionStatus;
module.exports.closeConnection = closeConnection;
