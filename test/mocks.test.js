const request = require("supertest");
const { expect } = require("chai");
const app = require("../src/app.js");
const { cleanDatabase } = require("./helpers.js");

describe("Mocks - /api/v1/mocks", () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  describe("GET /api/v1/mocks/users?qty=N", () => {
    it("devuelve 200 con N usuarios simulados y su estructura", async () => {
      const res = await request(app).get("/api/v1/mocks/users?qty=3");

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body.payload).to.be.an("array").with.lengthOf(3);

      const user = res.body.payload[0];
      expect(user).to.include.keys("first_name", "last_name", "email", "role");
    });

    it("devuelve 400 con el formato de error si qty es 0", async () => {
      const res = await request(app).get("/api/v1/mocks/users?qty=0");

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "Argumento inválido o faltante",
      });
    });

    it("devuelve 400 con el formato de error si qty no es numérico", async () => {
      const res = await request(app).get("/api/v1/mocks/users?qty=abc");

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "Argumento inválido o faltante",
      });
    });
  });

  describe("GET /api/v1/mocks/orders?qty=N", () => {
    it("devuelve 200 con N pedidos simulados y su estructura", async () => {
      const res = await request(app).get("/api/v1/mocks/orders?qty=2");

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.be.an("array").with.lengthOf(2);

      const order = res.body.payload[0];
      expect(order).to.include.keys("user", "items", "total", "status", "priority", "shipping_address");
    });

    it("devuelve 400 con el formato de error si qty es negativo", async () => {
      const res = await request(app).get("/api/v1/mocks/orders?qty=-5");

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "Argumento inválido o faltante",
      });
    });
  });

  describe("POST /api/v1/mocks/seed?qty=N", () => {
    it("inserta datos relacionados y devuelve 201 con el detalle", async () => {
      const res = await request(app).post("/api/v1/mocks/seed?qty=3");

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("insertados", 9);
      expect(res.body.detalle).to.deep.equal({
        usuarios: 3,
        pedidos: 3,
        entregas: 3,
      });
    });

    it("devuelve 400 con el formato de error si qty es inválido", async () => {
      const res = await request(app).post("/api/v1/mocks/seed?qty=0");

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "Argumento inválido o faltante",
      });
    });
  });
});
