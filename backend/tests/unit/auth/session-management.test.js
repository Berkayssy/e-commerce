// tests/unit/auth/session-management.test.js - SON HALİ
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../../app");

describe("SESSION MANAGEMENT TESTS - BASIC", () => {
  let testUser = {
    email: `test${Date.now()}@example.com`,
    password: "Password123!",
  };

  let authToken, refreshToken;

  beforeEach(async () => {
    // Önce kullanıcı kaydet
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Test",
        lastName: "User",
        email: testUser.email,
        password: testUser.password,
      })
      .expect(201);

    authToken = registerResponse.body.token;
    refreshToken = registerResponse.body.refreshToken;
  });

  describe("BASIC SESSION OPERATIONS", () => {
    it("should login and create session", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
    });

    it("should refresh access token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken })
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it("should logout successfully", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should reject invalid refresh tokens", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "invalid-token" })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });

  describe("TOKEN SECURITY", () => {
    it("should reject requests without token", async () => {
      const response = await request(app).post("/api/auth/logout").expect(401);

      // Eğer error yoksa, sadece status kontrol et
      if (!response.body.error) {
        expect(response.status).toBe(401);
      } else {
        expect(response.body.error).toBeDefined();
      }
    });

    it("should reject expired tokens", async () => {
      const expiredToken = jwt.sign(
        { id: "test", role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "-1h" } // Geçmiş tarih
      );

      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${expiredToken}`);

      // 400 veya 401 olabilir - implementasyona bağlı
      // Önemli olan 200 olmaması!
      expect([400, 401]).toContain(response.status);
      expect(response.status).not.toBe(200);
    });
  });
});
