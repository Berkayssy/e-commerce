const request = require("supertest");
const express = require("express");

const authRoutes = require("../../../modules/auth/auth.routes");
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Route Validation Tests", () => {
  describe("Register Validation", () => {
    it("should validate email format", async () => {
      const response = await request(app).post("/api/auth/register").send({
        firstName: "Test",
        lastName: "User",
        email: "invalid-email", // Invalid email format
        password: "password123",
      });

      // Expect validation error - could be 400, 422, or similar
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);

      // Check if there's any error indication in response
      const hasError =
        response.body.error || response.body.message || response.body.errors;
      expect(hasError).toBeDefined();
    });

    it("should validate password strength", async () => {
      const response = await request(app).post("/api/auth/register").send({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "123", // Weak password
      });

      // Expect validation error
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);

      const hasError =
        response.body.error || response.body.message || response.body.errors;
      expect(hasError).toBeDefined();
    });
  });

  describe("Login Validation", () => {
    it("should validate required fields for login", async () => {
      const response = await request(app).post("/api/auth/login").send({}); // Empty body

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);

      const hasError = response.body.error || response.body.message;
      expect(hasError).toBeDefined();
    });

    it("should validate email format for login", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "invalid-email-format",
        password: "password123",
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
    });
  });
});
