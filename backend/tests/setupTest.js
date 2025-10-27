const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-super-secret-key-for-jwt-tokens-in-testing";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key-for-testing-only";
process.env.JWT_EXPIRES = "1h";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  // CRITICAL: DB hazır olana kadar bekle
  await new Promise((resolve) => setTimeout(resolve, 100));
});

afterEach(async () => {
  // TÜM collection'ları temizle
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }

  // CRITICAL: Temizlik sonrası bekle
  await new Promise((resolve) => setTimeout(resolve, 50));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
