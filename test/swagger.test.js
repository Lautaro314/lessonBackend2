const request = require("supertest");
const { expect } = require("chai");
const app = require("../src/app.js");

describe("Swagger - /api/v1/docs", () => {
  it("sirve la documentación de la API con status 200", async () => {
    const res = await request(app).get("/api/v1/docs/");

    expect(res.status).to.equal(200);
    expect(res.headers["content-type"]).to.match(/html/);
  });

  it("la especificación OpenAPI incluye las rutas documentadas", () => {
    const swaggerSpecs = require("../src/config/swagger.config.js");

    expect(swaggerSpecs).to.have.property("openapi");
    expect(swaggerSpecs.paths).to.include.keys(
      "/api/v1/mocks/users",
      "/api/v1/mocks/orders",
      "/api/v1/mocks/seed",
      "/api/v1/test/loggerTest"
    );
  });
});
