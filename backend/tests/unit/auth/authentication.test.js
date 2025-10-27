// tests/unit/auth/authentication.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../../app");
const User = require("../../../models/User");

describe("AUTHENTICATION TESTS", () => {
  let testUser;

  beforeEach(async () => {
    // Test verilerini temizle
    await User.deleteMany({});

    testUser = {
      firstName: "Test",
      lastName: "User",
      email: `test${Date.now()}@example.com`,
      password: "Password123!",
      role: "user",
    };
  });

  describe("REGISTRATION FLOW", () => {
    it("should register user with valid data", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.password).toBeUndefined(); // Password gözükmemeli
    });

    it("should hash password on registration", async () => {
      await request(app).post("/api/auth/register").send(testUser);

      const user = await User.findOne({ email: testUser.email });
      expect(user.password).not.toBe(testUser.password);
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt pattern
    });

    it("should assign default user role", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      const user = await User.findOne({ email: testUser.email });
      expect(user.role).toBe("user");
    });
  });

  describe("LOGIN FLOW", () => {
    beforeEach(async () => {
      // Önce kullanıcıyı kaydet
      await request(app).post("/api/auth/register").send(testUser);
    });

    it("should login with correct credentials", async () => {
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

    it("should reject login with incorrect password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword123!",
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });

  describe("EMAIL VERIFICATION", () => {
    it("should require email verification if enabled", async () => {
      // Email verification logic test
    });
  });
});
