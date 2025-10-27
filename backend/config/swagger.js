// backend/config/swagger.js
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Galeria E-Commerce API",
      version: "1.0.0",
      description: "Complete E-Commerce REST API with JWT Authentication",
      contact: {
        name: "galeria API Support",
        email: "support@galeria.nl",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Development server",
      },
      {
        url: "https://api.galeria.nl",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // Buraya şemaları ekleyeceğiz
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "User login and registration",
      },
      {
        name: "Products",
        description: "Product management",
      },
      {
        name: "Orders",
        description: "Order processing",
      },
      {
        name: "Payments",
        description: "Payment processing with Stripe",
      },
    ],
  },
  apis: [
    "./routes/*.js", // Mevcut route dosyaların
    "./docs/schemas/*.js", // Yeni şema dosyaları
    "./docs/paths/*.js", // Yeni path tanımları
  ],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
