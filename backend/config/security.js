const helmet = require("helmet");
const logger = require("../utils/logger");

// Security configuration
// Note: Rate limiting and XSS protection are handled in app.js middleware stack
// This file only provides additional security middleware if needed

function applySecurity(app) {
  // Helmet is already applied via securityHeaders middleware in app.js
  // This function is kept for backward compatibility and future extensions

  logger.info(
    "🛡️ Security middleware initialized (rate limiting and XSS handled in app.js)"
  );

  // Additional security middleware can be added here if needed
  // For now, all security is handled by:
  // - securityHeaders.js (Helmet + custom headers)
  // - rateLimiting.js (Rate limiting with Redis)
  // - sanitizeInput.js (XSS protection)
}

module.exports = applySecurity;
