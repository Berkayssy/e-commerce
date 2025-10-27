const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Try to connect for 5 seconds
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("♻️ MongoDB reconnected");
    });
  } catch (err) {
    logger.error("❌ MongoDB connection failed:", err.message);
    logger.warn("Server will continue without database connection");
  }
};

module.exports = connectDB;
