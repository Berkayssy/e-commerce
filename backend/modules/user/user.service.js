const User = require("../../models/User");

exports.getUserById = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return {
        success: false,
        status: 404,
        message: "User not found",
      };
    }
    return {
      success: true,
      status: 200,
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: "Failed to get user",
      details: error.message,
    };
  }
};

exports.updateUser = async (userId, updateData) => {
  try {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return {
        success: false,
        status: 404,
        message: "User not found",
      };
    }

    return {
      success: true,
      status: 200,
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: "Failed to update user",
      details: error.message,
    };
  }
};

exports.getAllUsers = async () => {
  try {
    const users = await User.find().select("-password");
    return {
      success: true,
      status: 200,
      data: users,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: "Failed to get users",
      details: error.message,
    };
  }
};

exports.deleteUser = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return {
        success: false,
        status: 404,
        message: "User not found",
      };
    }
    return {
      success: true,
      status: 200,
      message: "User deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: "Failed to delete user",
      details: error.message,
    };
  }
};
