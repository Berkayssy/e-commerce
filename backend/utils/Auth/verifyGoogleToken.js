const { OAuth2Client } = require("google-auth-library");

module.exports = async function verifyGoogleToken({
  token,
  access_token,
  userInfo,
}) {
  try {
    console.log("🔐 Verifying Google token...");

    // Eğer development modundaysa, mock data dön
    if (process.env.NODE_ENV === "development" || !token) {
      console.log("🔄 Development mode: Using mock Google data");
      return {
        email: `google_user_${Date.now()}@example.com`,
        name: "Google Test User",
        picture: "https://via.placeholder.com/150",
        sub: `dev_google_id_${Date.now()}`,
      };
    }

    // Gerçek Google token verify
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    console.log("✅ Google token verified:", {
      email: payload.email,
      name: payload.name,
    });

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub,
    };
  } catch (err) {
    console.error("❌ Google Token verification failed:", err);

    // Development için fallback
    if (process.env.NODE_ENV === "development") {
      console.log("🔄 Fallback to development mock data");
      return {
        email: `fallback_${Date.now()}@example.com`,
        name: "Fallback User",
        picture: "https://via.placeholder.com/150",
        sub: `fallback_${Date.now()}`,
      };
    }

    throw new Error("Invalid Google token: " + err.message);
  }
};
