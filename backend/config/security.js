const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xss = require("xss");

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests from this IP" },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many authentication attempts" },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// XSS Protection
const xssProtection = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = xss(req.body[key]);
      }
    });
  }
  next();
};

// Security configuration
function applySecurity(app) {
  console.log("🛡️  Applying security middleware...");

  // Helmet
  app.use(helmet());

  // Rate limiting
  app.use(generalLimiter);
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);

  // XSS protection
  app.use(xssProtection);

  console.log("✅ Security middleware applied");
}

module.exports = applySecurity;
