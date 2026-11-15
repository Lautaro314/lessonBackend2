const request = require("supertest");
const { expect } = require("chai");
const app = require("../src/app.js");

describe("Ruta inexistente", () => {
  it("devuelve 404 con el formato de error del módulo de errores", async () => {
    const res = await request(app).get("/api/v1/esta-ruta-no-existe");

    expect(res.status).to.equal(404);
    expect(res.body).to.deep.equal({
      status: "fail",
      error: "La ruta solicitada no existe",
    });
  });
});
