const request = require("supertest");
const { expect } = require("chai");
const app = require("../src/app.js");
const OrderModel = require("../src/models/order.model.js");
const { cleanDatabase, createUser, buildOrderData } = require("./helpers.js");

describe("Pedidos - /api/v1/orders", () => {
  let user;

  beforeEach(async () => {
    await cleanDatabase();
    // Datos controlados: creamos un usuario válido antes de operar con pedidos.
    user = await createUser({ email: "cliente@shipnow.test" });
  });

  describe("GET /api/v1/orders", () => {
    it("devuelve 200 con un array vacío cuando no hay pedidos", async () => {
      const res = await request(app).get("/api/v1/orders");

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body.payload).to.be.an("array").with.lengthOf(0);
    });

    it("devuelve 200 con el listado de pedidos existentes", async () => {
      await OrderModel.create(buildOrderData(user._id));

      const res = await request(app).get("/api/v1/orders");

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.be.an("array").with.lengthOf(1);
      expect(res.body.payload[0]).to.include.keys("_id", "user", "items", "total", "status");
    });
  });

  describe("POST /api/v1/orders", () => {
    it("crea un pedido válido, calcula el total y devuelve 201", async () => {
      const res = await request(app).post("/api/v1/orders").send({
        user: user._id.toString(),
        items: [
          { product_name: "Caja chica", quantity: 2, price: 100 },
          { product_name: "Caja grande", quantity: 1, price: 50 },
        ],
        shipping_address: "Av. Siempre Viva 742",
      });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("status", "success");
      expect(res.body.payload).to.have.property("total", 250);
      expect(res.body.payload).to.have.property("status", "PENDING");
      expect(res.body.payload.items).to.be.an("array").with.lengthOf(2);
    });

    it("devuelve 400 con el formato de error si no se envían items", async () => {
      const res = await request(app).post("/api/v1/orders").send({
        user: user._id.toString(),
        shipping_address: "Av. Siempre Viva 742",
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "Argumento inválido o faltante",
      });
    });
  });

  describe("GET /api/v1/orders/:id", () => {
    it("devuelve 200 con el pedido solicitado", async () => {
      const order = await OrderModel.create(buildOrderData(user._id));

      const res = await request(app).get(`/api/v1/orders/${order._id}`);

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.have.property("_id", order._id.toString());
      expect(res.body.payload).to.have.property("user", user._id.toString());
    });

    it("devuelve 404 con el formato de error si el pedido no existe", async () => {
      const res = await request(app).get("/api/v1/orders/64b7f0c2f1a2b3c4d5e6f7a8");

      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "El pedido solicitado no existe",
      });
    });
  });

  describe("PUT /api/v1/orders/:id (actualización de estado)", () => {
    it("actualiza el estado a un valor válido y devuelve 200", async () => {
      const order = await OrderModel.create(buildOrderData(user._id));

      const res = await request(app)
        .put(`/api/v1/orders/${order._id}`)
        .send({ status: "IN_TRANSIT" });

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.have.property("status", "IN_TRANSIT");
    });

    it("devuelve 400 con el formato de error si el estado es inválido", async () => {
      const order = await OrderModel.create(buildOrderData(user._id));

      const res = await request(app)
        .put(`/api/v1/orders/${order._id}`)
        .send({ status: "ESTADO_INEXISTENTE" });

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "El estado proporcionado no es válido",
      });
    });

    it("devuelve 404 con el formato de error si el pedido no existe", async () => {
      const res = await request(app)
        .put("/api/v1/orders/64b7f0c2f1a2b3c4d5e6f7a8")
        .send({ status: "DELIVERED" });

      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "El pedido solicitado no existe",
      });
    });
  });
});
