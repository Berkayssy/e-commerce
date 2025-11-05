const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const requiredVars = ["PORT", "MONGO_URI", "JWT_SECRET"];
requiredVars.forEach((v) => {
  if (!process.env[v]) {
    throw new Error(`❌ Missing required environment variable: ${v}`);
  }
});

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:4000",
  ],
};
