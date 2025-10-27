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

  REDIS_URL: Joi.string()
    .default("redis://localhost:6379")
    .description("Redis connection URL"),

  FRONTEND_URL: Joi.string().uri().description("Frontend URL for CORS"),

  GOOGLE_CLIENT_ID: Joi.string().description("Google OAuth Client ID"),

  CLOUDINARY_CLOUD_NAME: Joi.string().description("Cloudinary cloud name"),

  CLOUDINARY_API_KEY: Joi.string().description("Cloudinary API key"),

  CLOUDINARY_API_SECRET: Joi.string().description("Cloudinary API secret"),
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
  REDIS_URL: envVars.REDIS_URL,
  FRONTEND_URL: envVars.FRONTEND_URL,
  GOOGLE_CLIENT_ID: envVars.GOOGLE_CLIENT_ID,
  CLOUDINARY_CLOUD_NAME: envVars.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: envVars.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: envVars.CLOUDINARY_API_SECRET,
};
