const Joi = require("joi");

// Environment validation schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),

  PORT: Joi.number().default(5000),

  MONGO_URI: Joi.string().required().description("MongoDB connection string"),

  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description("JWT secret key (minimum 32 characters)"),

  JWT_EXPIRES: Joi.string().default("1d").description("JWT expiration time"),

  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .required()
    .description("JWT refresh token secret (minimum 32 characters)"),

  JWT_REFRESH_EXPIRE: Joi.string()
    .default("7d")
    .description("JWT refresh token expiration time"),

  REDIS_URL: Joi.string()
    .default("redis://localhost:6379")
    .description("Redis connection URL"),

  FRONTEND_URL: Joi.string().uri().description("Frontend URL for CORS"),

  GOOGLE_CLIENT_ID: Joi.string().description("Google OAuth Client ID"),

  CLOUDINARY_CLOUD_NAME: Joi.string().description("Cloudinary cloud name"),

  CLOUDINARY_API_KEY: Joi.string().description("Cloudinary API key"),

  CLOUDINARY_API_SECRET: Joi.string().description("Cloudinary API secret"),

  CORS_ORIGINS: Joi.string()
    .description("Comma-separated list of allowed CORS origins")
    .default("http://localhost:3000,http://localhost:3001"),

  JSON_BODY_LIMIT: Joi.string()
    .default("1mb")
    .description("Maximum JSON body size"),

  URLENCODED_BODY_LIMIT: Joi.string()
    .default("1mb")
    .description("Maximum URL-encoded body size"),

  FAIL_FAST_DB: Joi.string()
    .valid("true", "false")
    .default("true")
    .description("Exit process if database connection fails in production"),

  EMAIL_USER: Joi.string()
    .email()
    .description("Email service username (for sending emails)"),

  EMAIL_PASS: Joi.string().description(
    "Email service password or app password"
  ),
}).unknown();

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

// Export validated environment variables
module.exports = {
  NODE_ENV: envVars.NODE_ENV,
  PORT: envVars.PORT,
  MONGO_URI: envVars.MONGO_URI,
  JWT_SECRET: envVars.JWT_SECRET,
  JWT_EXPIRES: envVars.JWT_EXPIRES,
  JWT_REFRESH_SECRET: envVars.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRE: envVars.JWT_REFRESH_EXPIRE || "7d",
  REDIS_URL: envVars.REDIS_URL,
  FRONTEND_URL: envVars.FRONTEND_URL,
  GOOGLE_CLIENT_ID: envVars.GOOGLE_CLIENT_ID,
  CLOUDINARY_CLOUD_NAME: envVars.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: envVars.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: envVars.CLOUDINARY_API_SECRET,
  CORS_ORIGINS: envVars.CORS_ORIGINS?.split(",").map((origin) =>
    origin.trim()
  ) || ["http://localhost:3000", "http://localhost:3001"],
  JSON_BODY_LIMIT: envVars.JSON_BODY_LIMIT,
  URLENCODED_BODY_LIMIT: envVars.URLENCODED_BODY_LIMIT,
  FAIL_FAST_DB: envVars.FAIL_FAST_DB === "true",
  EMAIL_USER: envVars.EMAIL_USER,
  EMAIL_PASS: envVars.EMAIL_PASS,
};
