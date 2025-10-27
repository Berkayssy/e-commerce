const userService = require("./user.service");

exports.getUserProfile = async (req, res) => {
  try {
    const result = await userService.getUserById(req.user.id);
    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const result = await userService.updateUser(req.user.id, {
      firstName,
      lastName,
      email,
    });
    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsers();
    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const result = await userService.getUserById(req.params.id);
    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }
    res.status(result.status).json({ message: result.message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.countUsers = async (req, res) => {
  try {
    const result = await userService.countUsers();
    if (!result.success) {
      return res.status(result.status).json({ error: result.message });
    }
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// modules/auth/auth.controller.js
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // Logic: Generate reset token, send email, save to database
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    // Logic: Validate token, update password
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
