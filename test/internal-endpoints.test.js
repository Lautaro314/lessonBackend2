const request = require("supertest");
const { expect } = require("chai");
const app = require("../src/app.js");
const config = require("../src/config/env.config.js");

describe("Endpoints internos según entorno", () => {
  const originalMode = config.mode;

  afterEach(() => {
    config.mode = originalMode;
  });

  it("oculta mocks, logger test, process e /info en producción", async () => {
    config.mode = "production";

    const routes = [
      "/api/v1/mocks/users",
      "/api/v1/test/loggerTest",
      "/api/v1/luces/loggerTest",
      "/api/v1/process/blocking",
      "/info",
    ];

    for (const route of routes) {
      const res = await request(app).get(route);
      expect(res.status, route).to.equal(404);
      expect(res.body, route).to.deep.equal({
        status: "fail",
        error: "La ruta solicitada no existe",
      });
    }
  });

  it("mantiene health y Swagger disponibles en producción", async () => {
    config.mode = "production";

    const health = await request(app).get("/health");
    expect(health.status).to.equal(200);
    expect(health.body.status).to.equal("ok");

    const docs = await request(app).get("/api/v1/docs/");
    expect(docs.status).to.equal(200);
    expect(docs.headers["content-type"]).to.match(/html/);
  });

  it("permite las herramientas internas fuera de producción", async () => {
    const res = await request(app).get("/api/v1/test/loggerTest");

    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal("success");
  });
});
