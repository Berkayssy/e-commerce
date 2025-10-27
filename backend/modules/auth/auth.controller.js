const authService = require("./auth.service");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginService({ email, password });
    return res.status(200).json(result);
  } catch (err) {
    console.error("auth.login error:", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken({ refreshToken });
    return res.status(200).json(result);
  } catch (err) {
    console.error("auth.refreshToken error:", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const result = await authService.registerService({
      firstName,
      lastName,
      email,
      password,
    });
    return res.status(201).json(result);
  } catch (err) {
    console.error("auth.register error:", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
};

exports.googleAuthLogin = async (req, res) => {
  try {
    const result = await authService.googleAuthLoginService(req, res);
    return res.status(200).json(result);
  } catch (err) {
    console.error("auth.googleLogin error:", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
};

exports.googleOAuthCallback = async (req, res) => {
  try {
    const result = await authService.googleOAuthCallbackService(req, res);
    return res.status(200).json(result);
  } catch (err) {
    console.error("auth.googleOAuthCallback error:", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const result = await authService.logoutService(req);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 401).json({
      success: false,
      error: err.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPasswordService({ email });
    return res.status(200).json(result);
  } catch (err) {
    console.error("auth.forgotPassword error:", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    const result = await authService.resetPasswordService({
      token,
      password,
      confirmPassword,
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error("auth.resetPassword error:", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const result = await authService.getCurrentUserService({
      userId: req.user.id,
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error("auth.getCurrentUser error:", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
};

exports.sendVerification = async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({
        success: false,
        message: "User ID and email are required",
      });
    }
    const result = await authService.sendVerificationEmail(userId, email);

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Send verification controller error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const result = await authService.verifyEmailToken(token);

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Verify email controller error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await authService.resendVerificationEmail(email);

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Resend verification controller error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};
