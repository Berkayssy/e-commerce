// backend/config/db.js - BU KODU YAPIŞTIR:
const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    // ✅ DOCKER'DA KESİNLİKLE galeria-mongo KULLAN
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://galeria-mongo:27017/galeria";

    logger.info(`🔗 Connecting to MongoDB at ${mongoUri}`);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000, // 15 saniye
      socketTimeoutMS: 45000,
      bufferCommands: false,
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
