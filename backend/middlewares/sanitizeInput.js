const xss = require("xss");

const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== "object") return obj;

    const sanitized = Array.isArray(obj) ? [] : {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        sanitized[key] = xss(value.trim());
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);

  next();
};

module.exports = sanitizeInput;
