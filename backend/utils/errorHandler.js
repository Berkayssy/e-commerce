function errorHandler(error, functionName) {
  console.error(`Error in ${functionName}:`, error.message);

  // Known error with status
  if (error.status) {
    return {
      status: error.status,
      success: false,
      message: error.message,
    };
  }

  // Mongoose validation error
  if (error.name === "ValidationError") {
    return {
      status: 400,
      success: false,
      message: error.message,
    };
  }

  // Mongoose cast error
  if (error.name === "CastError") {
    return {
      status: 400,
      success: false,
      message: "Invalid ID format",
    };
  }

  // Mongoose duplicate key error
  if (error.name === "MongoError" && error.code === 11000) {
    return {
      status: 409,
      success: false,
      message: "Duplicate field value",
    };
  }

  // Default error
  return {
    status: 500,
    success: false,
    message: "Internal server error",
  };
}
function createError(message, status = 500) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = { errorHandler, createError };
