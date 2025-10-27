// utils/emailService.js
const nodemailer = require("nodemailer");

// Email transporter oluştur
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });
};

// Password reset email
exports.sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();

    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - Ecommerce App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested a password reset for your account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" 
             style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Ecommerce App Team
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent to:", email);
    return result;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Failed to send password reset email");
  }
};

// Email verification
exports.sendVerificationEmail = async (email, verificationToken) => {
  try {
    const transporter = createTransporter();

    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email - Ecommerce App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p>Thank you for registering! Please verify your email address.</p>
          <a href="${verificationLink}" 
             style="display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 4px;">
            Verify Email
          </a>
          <p>This link will expire in 24 hours.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Ecommerce App Team
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Verification email sent to:", email);
    return result;
  } catch (error) {
    console.error("❌ Verification email failed:", error);
    throw new Error("Failed to send verification email");
  }
};
