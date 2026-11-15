// Root hooks de Mocha: se cargan ANTES que los archivos de test.
// Seteamos las variables de entorno de testing a nivel superior para que
// env.config.js cargue .env.test (y nunca el .env de desarrollo).
process.env.NODE_ENV = "test";
process.env.PORT = process.env.PORT || "8080";
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shipnow_test";
process.env.SECRET = process.env.SECRET || "test_secret";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "test_google_client_id";
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "test_google_client_secret";
process.env.GOOGLE_CALLBACK =
  process.env.GOOGLE_CALLBACK || "http://localhost:8080/api/v1/auth/google/callback";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

exports.mochaHooks = {
  async beforeAll() {
    // Base de datos de testing aislada y descartable (en memoria).
    this.timeout(120000);
    mongoServer = await MongoMemoryServer.create({
      instance: { launchTimeout: 120000 },
    });
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
    await mongoose.connect(uri);
  },

  async afterAll() {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  },
};
