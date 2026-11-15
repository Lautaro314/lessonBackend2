const request = require("supertest");
const { expect } = require("chai");
const app = require("../src/app.js");

describe("Logger - /api/v1/test/loggerTest", () => {
  it("devuelve 200 y genera los logs de prueba", async () => {
    const res = await request(app).get("/api/v1/test/loggerTest");

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({
      status: "success",
      message: "Logs de prueba generados correctamente en todos los niveles.",
    });
  });
});
