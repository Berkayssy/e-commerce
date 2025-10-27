const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const { createError } = require("../utils/errorHandler");
const isAdminEmail = require("../utils/Auth/isAdminEmail");

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔐 Google OAuth Profile:", profile);

        const { id: googleId, displayName: name, photos, emails } = profile;
        const email = emails[0].value;
        const picture = photos[0]?.value;

        if (!email) {
          return done(createError("Google account has no email", 400), null);
        }

        // Role belirleme
        const role = req.query.role || "user";
        let userRole = "user";
        if (isAdminEmail(email)) userRole = "admin";
        else if (role === "seller") userRole = "seller";

        // Kullanıcıyı bul veya oluştur
        let user = await User.findOne({
          $or: [{ email: email }, { googleId: googleId }],
        });

        if (!user) {
          // İsimleri ayır
          const nameParts = name ? name.split(" ") : [];
          const firstName = nameParts[0] || email.split("@")[0];
          const lastName =
            nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

          user = new User({
            firstName,
            lastName,
            email,
            googleId,
            profilePicture: picture,
            role: userRole,
            isEmailVerified: true,
            authProvider: "google",
            password: crypto.randomBytes(16).toString("hex"),
          });

          await user.save();
          console.log("✅ New user created via OAuth:", user.email);
        } else {
          // Mevcut kullanıcıyı güncelle
          let changed = false;

          if (!user.googleId) {
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

          if (changed) {
            await user.save();
          }
        }

        return done(null, user);
      } catch (error) {
        console.error("❌ Passport Google Strategy error:", error);
        return done(error, null);
      }
    }
  )
);

// Serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
