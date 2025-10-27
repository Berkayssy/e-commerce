// tests/unit/auth/password-reset.test.js - SON HALİ
const request = require("supertest");
const app = require("../../../app");

describe("PASSWORD RESET TESTS - CURRENT IMPLEMENTATION", () => {
  describe("FORGOT PASSWORD", () => {
    it("should accept forgot-password requests", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "test@example.com" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("reset link");
    });

    it("should not reveal email existence", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent@example.com" })
        .expect(200);

      // Güvenlik: Email'in var olup olmadığını açık etmemeli
      expect(response.body.email).toBeUndefined();
      expect(response.body.message).toContain("If the email exists");
    });
  });

  describe("MISSING ENDPOINTS", () => {
    it("should indicate reset-password is not implemented", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "test", newPassword: "newpass" })
        .expect(404); // Endpoint mevcut değil

      console.log("ℹ️  reset-password endpoint not implemented");
    });

    it("should indicate change-password is not implemented", async () => {
      const response = await request(app)
        .post("/api/auth/change-password")
        .send({ currentPassword: "old", newPassword: "new" })
        .expect(404); // Endpoint mevcut değil

      console.log("ℹ️  change-password endpoint not implemented");
    });
  });
});
