// utils/responseHandler.js

/**
 * Unified API response handler
 * Ensures consistent structure across all controllers
 *
 * successResponse(res, data, message?, status?)
 * errorResponse(res, message?, status?, details?)
 */

exports.successResponse = (res, data = null, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data
  });
};

exports.errorResponse = (res, message = 'Internal Server Error', status = 500, details = null) => {
  // Optional: log the error for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${message}`, details || '');
  }

  return res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {}) // include details only if present
  });
};