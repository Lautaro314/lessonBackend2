const request = require("supertest");
const { expect } = require("chai");
const app = require("../src/app.js");
const DeliveryModel = require("../src/models/delivery.model.js");
const { cleanDatabase, createUser, buildOrderData } = require("./helpers.js");
const OrderModel = require("../src/models/order.model.js");

describe("Entregas - /api/v1/deliveries", () => {
  let user;
  let order;

  beforeEach(async () => {
    await cleanDatabase();
    user = await createUser({ email: "repartidor@shipnow.test", role: "DELIVERY" });
    order = await OrderModel.create(buildOrderData(user._id));
  });

  it("devuelve entregas paginadas con filtros permitidos", async () => {
    await DeliveryModel.create({
      order: order._id,
      delivery_driver: user._id,
      tracking_code: "TRK-001",
      status: "IN_TRANSIT",
    });
    await DeliveryModel.create({
      order: order._id,
      delivery_driver: user._id,
      tracking_code: "TRK-002",
      status: "DELIVERED",
    });

    const res = await request(app).get("/api/v1/deliveries?status=IN_TRANSIT&limit=1");

    expect(res.status).to.equal(200);
    expect(res.body.payload).to.have.lengthOf(1);
    expect(res.body.payload[0]).to.include.keys("_id", "order", "delivery_driver", "tracking_code", "status");
    expect(res.body.payload[0].status).to.equal("IN_TRANSIT");
    expect(res.body.pagination).to.include({ total: 1, page: 1, limit: 1 });
  });

  it("devuelve un array vacío cuando no hay entregas", async () => {
    const res = await request(app).get("/api/v1/deliveries");

    expect(res.status).to.equal(200);
    expect(res.body.payload).to.be.an("array").with.lengthOf(0);
    expect(res.body.pagination.total).to.equal(0);
  });

  it("rechaza filtros con ids inválidos", async () => {
    const res = await request(app).get("/api/v1/deliveries?order=invalid");

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("status", "fail");
  });
});
