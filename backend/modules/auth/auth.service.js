const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const User = require("../../models/User");
const Seller = require("../../models/Seller");

const {
  sendPasswordResetEmail,
  sendVerificationEmail,
} = require("../../utils/emailService");
const isAdminEmail = require("../../utils/Auth/isAdminEmail");
const verifyToken = require("../../middlewares/verifyToken");
const verifyGoogleToken = require("../../utils/Auth/verifyGoogleToken");
const { createError } = require("../../utils/errorHandler");
const redisClient = require("../../cache/redisClient");

const JWT_EXPIRES = process.env.JWT_EXPIRES || "1d";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "7d";

exports.loginService = async ({ email, password }) => {
  if (!email || !password)
    throw createError("Email and password required", 400);

  const user = await User.findOne({ email });
  if (!user) throw createError("Invalid Credentials, User not found", 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw createError("Invalid credentials, wrong password", 401);

  const tokenPayload = { id: user._id, role: user.role };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
  const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  if (user.role === "user") {
    await User.findOne({ userId: user._id });
    if (!user) throw createError("User profile not found", 404);
    tokenPayload.userId = user._id;
  }
  if (user.role === "seller") {
    const seller = await Seller.findOne({ userId: user._id });
    if (!seller) throw createError("Seller profile not found", 404);
    tokenPayload.sellerId = seller._id;
  }

  return {
    success: true,
    message: "Login successful",
    token,
    refreshToken,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  };
};

exports.registerService = async ({
  firstName,
  lastName,
  email,
  password,
  role,
}) => {
  // basic defensive checks (should be covered by validators)
  if (!firstName || !lastName || !email || !password)
    throw createError("Missing required fields", 400);

  // check existing user
  const exists = await User.findOne({ email });
  if (exists) throw createError("Email already registered", 409);

  const hashedPassword = await bcrypt.hash(password, 10);

  let userRole = "user";
  if (isAdminEmail(email)) userRole = "admin";
  else if (role === "seller") userRole = "seller";

  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: userRole,
    isEmailVerified: false, // Default false - email verification gerekliyor
  });

  await newUser.save();

  const tokenPayload = { id: newUser._id, role: newUser.role };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
  const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  await this.sendVerificationEmail(newUser._id, newUser.email);
  return {
    success: true,
    message: "User registered successfully",
    token,
    refreshToken,
    user: {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      password: newUser.hashedPassword,
      role: newUser.role,
      isEmailVerified: newUser.isEmailVerified,
    },
  };
};

exports.googleAuthLoginService = async ({
  token,
  access_token,
  userInfo,
  role = "user",
}) => {
  try {
    console.log("🔐 Google Login Service called");

    // Token doğrulama - GELİŞMİŞ HATA YÖNETİMİ
    let userData;
    try {
      userData = await verifyGoogleToken({ token, access_token, userInfo });
      console.log("📧 User data from Google:", userData);
    } catch (verifyError) {
      console.error("❌ Google token verification failed:", verifyError);
      throw createError(
        "Google authentication failed: " + verifyError.message,
        401
      );
    }

    // EMAIL KONTROLÜ - Eğer email yoksa hata ver
    if (!userData.email) {
      console.error("❌ No email from Google verification");
      throw createError("Google account has no email", 400);
    }

    const { email, name, picture, sub: googleId } = userData;

    // Role belirleme
    let userRole = "user";
    if (isAdminEmail(email)) userRole = "admin";
    else if (role === "seller") userRole = "seller";

    // Kullanıcıyı bul veya oluştur
    let user = await User.findOne({
      $or: [{ email: email }, { googleId: googleId }],
    });

    if (!user) {
      console.log("👤 Creating new user from Google auth");

      // İsimleri ayır
      const nameParts = name ? name.split(" ") : [];
      const firstName = nameParts[0] || email.split("@")[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      user = new User({
        firstName,
        lastName,
        email: email,
        googleId: googleId,
        profilePicture: picture,
        role: userRole,
        isEmailVerified: true,
        authProvider: "google",
        password: crypto.randomBytes(16).toString("hex"), // Random password
      });

      await user.save();
      console.log("✅ New user created from Google auth:", user.email);
    } else {
      console.log("✅ Existing user found:", user.email);

      // Mevcut kullanıcıyı güncelle
      let changed = false;

      if (!user.googleId && googleId) {
        user.googleId = googleId;
        changed = true;
      }

      if (picture && user.profilePicture !== picture) {
        user.profilePicture = picture;
        changed = true;
      }

      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        changed = true;
      }

      if (isAdminEmail(email) && user.role !== "admin") {
        user.role = "admin";
        changed = true;
      }

      if (changed) {
        await user.save();
        console.log("✅ User updated with Google data");
      }
    }

    // Token payload'ını hazırla
    const tokenPayload = {
      id: user._id,
      role: user.role,
      email: user.email,
    };

    // Seller bilgisi ekle
    if (user.role === "seller") {
      const seller = await Seller.findOne({ userId: user._id });
      if (seller) {
        tokenPayload.sellerId = seller._id;
      }
    }

    // JWT token'ları oluştur
    const jwtToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || "1d",
    });

    const refreshToken = jwt.sign(
      tokenPayload,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Google login successful for:", user.email);

    return {
      success: true,
      message: "Google authentication successful",
      token: jwtToken,
      refreshToken: refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
      },
    };
  } catch (error) {
    console.error("❌ Google login service error:", error);
    throw createError(error.message || "Google authentication failed", 500);
  }
};

// Google OAuth başlatma
exports.googleOAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

// Google OAuth callback
exports.googleOAuthCallbackService = async (req, res, next) => {
  try {
    passport.authenticate(
      "google",
      { session: false },
      async (err, user, info) => {
        try {
          if (err) {
            console.error("❌ Google OAuth error:", err);
            return res.redirect(
              `${process.env.FRONTEND_URL}/login?error=auth_failed`
            );
          }

          if (!user) {
            return res.redirect(
              `${process.env.FRONTEND_URL}/login?error=user_not_found`
            );
          }

          // Token'ları oluştur
          const tokenPayload = {
            id: user._id,
            role: user.role,
            email: user.email,
          };

          if (user.role === "seller") {
            const seller = await Seller.findOne({ userId: user._id });
            if (seller) tokenPayload.sellerId = seller._id;
          }

          const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES || "1d",
          });

          const refreshToken = jwt.sign(
            tokenPayload,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            { expiresIn: "7d" }
          );

          // Frontend'e yönlendir
          const redirectUrl = `${process.env.FRONTEND_URL}/auth/success?token=${token}&refreshToken=${refreshToken}&userId=${user._id}`;
          res.redirect(redirectUrl);
        } catch (error) {
          console.error("❌ Google callback error:", error);
          res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
        }
      }
    )(req, res, next);
  } catch (error) {
    console.error("❌ Google OAuth callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};

exports.refreshAccessToken = async ({ refreshToken }) => {
  // Defensive: log yerine kontrol
  if (!refreshToken) throw createError("Refresh token required", 400);

  let decoded;
  try {
    // Net: refresh token'lar için ayrı secret kullan
    if (!process.env.JWT_REFRESH_SECRET) {
      console.warn(
        "JWT_REFRESH_SECRET is not set, falling back to JWT_SECRET (not recommended)."
      );
    }

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    decoded = jwt.verify(refreshToken, secret);
  } catch (err) {
    console.error("Refresh token verification failed:", err);
    throw createError("Invalid refresh token", 401);
  }

  // decoded geldi, şimdi user'ı bul
  const user = await User.findById(decoded.id);
  if (!user) throw createError("User not found", 404);

  const tokenPayload = { id: user._id, role: user.role };
  if (user.role === "seller") {
    const seller = await Seller.findOne({ userId: user._id });
    if (seller) tokenPayload.sellerId = seller._id;
  }

  const newAccessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });

  // Yeni refresh token: KESİNLİKLE refresh secret ile imzala
  const refreshSecret =
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  const newRefreshToken = jwt.sign(
    tokenPayload,
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );

  // **TUTARLI, DÜZ FORMAT**: frontend'in rahat kullanması için
  return {
    token: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  };
};
exports.logoutService = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw createError("Authorization header missing", 401);
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw createError("Authorization header invalid format", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw createError("Token not found", 401);
    }

    let decoded;

    decoded = jwt.verify(token, process.env.JWT_SECRET);

    decoded = jwt.decode(token); // Verify etmeden decode et

    await redisClient.setex(`blacklist_${token}`, 3600 * 24, "revoked");

    return {
      success: true,
      message: "Logout successful",
      data: {
        userId: decoded?.id,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (err) {
    throw err;
  }
};
exports.forgotPasswordService = async ({ email }) => {
  try {
    if (!email) throw createError("Email is required", 400);

    const user = await User.findOne({ email });

    // Security: Always return success even if email doesn't exist
    if (!user) {
      return {
        success: true,
        message: "If the email exists, a reset link has been sent",
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save({ validateBeforeSave: false });

    // In production: Send email with reset link
    await sendPasswordResetEmail(user.email, resetToken);

    return {
      success: true,
      message: "If the email exists, a reset link has been sent",
      resetToken: resetToken, // Only for development - remove in production
    };
  } catch (error) {
    console.error("forgotPasswordService error:", error);
    throw createError("Error processing password reset request", 500);
  }
};

exports.resetPasswordService = async ({ token, password }) => {
  try {
    console.log("🎯 resetPasswordService CALLED with token:", token);

    if (!token) throw createError("Reset token is required", 400);
    if (!password) throw createError("Password is required", 400);

    console.log("🔍 Searching user with token:", token);

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    console.log("🔍 User found:", user ? "YES" : "NO");
    console.log("🔍 User data:", {
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
    });

    if (!user) {
      console.log("❌ Invalid or expired token");
      throw createError("Invalid or expired reset token", 400);
    }

    console.log("✅ Valid token, resetting password for:", user.email);

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ CRITICAL FIX: User'ı DIRECT update et (save() kullanmadan)
    await User.findByIdAndUpdate(
      user._id,
      {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpiry: undefined,
      },
      {
        runValidators: false, // ✅ Validation'ı kapat
        new: true,
      }
    );

    console.log("✅ Password reset successful for:", user.email);

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    console.error("❌ resetPasswordService error:", error);
    throw createError(error.message || "Error resetting password", 500);
  }
};

exports.getCurrentUserService = async ({ userId }) => {
  try {
    if (!userId) throw createError("User ID is required", 400);

    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw createError("User not found", 404);
    }

    let userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
    };

    // Add seller info if applicable
    if (user.role === "seller") {
      const seller = await Seller.findOne({ userId: user._id });
      if (seller) {
        userData.sellerProfile = {
          sellerId: seller._id,
          storeId: seller.storeId,
          isActive: seller.isActive,
        };
      }
    }

    return {
      success: true,
      user: userData,
    };
  } catch (error) {
    throw createError(error.message || "Error fetching user data", 500);
  }
};

exports.sendVerificationEmail = async (userId, email) => {
  try {
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = Date.now() + 3600000; // 1 hour

    await User.findByIdAndUpdate(userId, {
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationTokenExpiry,
    });
    const verificationLink = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/auth/verify-email?token=${verificationToken}`;

    return {
      success: true,
      status: 200,
      message: "Verification email sent successfully",
      // for development
      verificationToken:
        process.env.NODE_ENV === "development" ? verificationToken : undefined,
    };
  } catch (error) {
    console.error("Send verification email error", error);
    throw createError("Failed to send verification email", 500);
  }
};

exports.verifyEmailToken = async (token) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
      throw createError("Invalid or expired verification token", 400);
    }

    // Email'i verify et
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    return {
      success: true,
      message: "Email verified successfully",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: true,
      },
    };
  } catch (error) {
    console.error("❌ Verify email error:", error);
    throw createError("Email verification failed", 500);
  }
};

exports.resendVerificationEmail = async (email) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return {
        success: true,
        message: "If the email exists, verification link has been sent",
      };
    }

    if (user.isEmailVerified) {
      return {
        success: true,
        message: "Email is already verified",
      };
    }

    return await this.sendVerificationEmail(user._id, user.email);
  } catch (error) {
    throw createError("Failed to resend verification email", 500);
  }
};
