const request = require("supertest");
const { expect } = require("chai");
const app = require("../src/app.js");
const OrderModel = require("../src/models/order.model.js");
const UserModel = require("../src/models/user.model.js");
const { cleanDatabase, createUser, buildOrderData } = require("./helpers.js");

describe("Paginación y filtros", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("GET /api/v1/users", () => {
    it("limita el resultado y devuelve metadatos de paginación", async () => {
      await createUser({ email: "page1@shipnow.test" });
      await createUser({ email: "page2@shipnow.test" });
      await createUser({ email: "page3@shipnow.test", role: "ADMIN" });

      const firstPage = await request(app).get("/api/v1/users?limit=2&page=1");
      expect(firstPage.status).to.equal(200);
      expect(firstPage.body.payload).to.have.lengthOf(2);
      expect(firstPage.body.pagination).to.include({
        total: 3,
        page: 1,
        limit: 2,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
      });

      const secondPage = await request(app).get("/api/v1/users?limit=2&page=2");
      expect(secondPage.body.payload).to.have.lengthOf(1);
      expect(secondPage.body.pagination).to.include({ page: 2, hasNext: false, hasPrev: true });
    });

    it("acepta filtros permitidos y no deja sobrescribir isDeleted", async () => {
      await createUser({ email: "admin@shipnow.test", role: "ADMIN" });
      await createUser({ email: "user@shipnow.test", role: "USER" });
      const deleted = await createUser({ email: "deleted@shipnow.test", role: "ADMIN" });
      await UserModel.findByIdAndUpdate(deleted._id, { isDeleted: true });

      const filtered = await request(app).get("/api/v1/users?role=ADMIN");
      expect(filtered.body.payload).to.have.lengthOf(1);
      expect(filtered.body.payload[0].email).to.equal("admin@shipnow.test");

      const withDeletedParam = await request(app).get("/api/v1/users?isDeleted=true");
      expect(withDeletedParam.body.payload).to.have.lengthOf(2);
      expect(withDeletedParam.body.payload.map((u) => u.email)).to.not.include("deleted@shipnow.test");
    });

    it("rechaza paginación inválida y filtros fuera de la whitelist", async () => {
      const badPage = await request(app).get("/api/v1/users?page=0");
      expect(badPage.status).to.equal(400);

      const badLimit = await request(app).get("/api/v1/users?limit=101");
      expect(badLimit.status).to.equal(400);

      const badRole = await request(app).get("/api/v1/users?role=NOT_A_ROLE");
      expect(badRole.status).to.equal(400);
    });
  });

  describe("GET /api/v1/orders", () => {
    it("filtra por estado y aplica paginación", async () => {
      const user = await createUser({ email: "orders@shipnow.test" });
      await OrderModel.create(buildOrderData(user._id, { status: "DELIVERED" }));
      await OrderModel.create(buildOrderData(user._id, { status: "PENDING" }));

      const res = await request(app).get("/api/v1/orders?status=DELIVERED&limit=1");

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.have.lengthOf(1);
      expect(res.body.payload[0].status).to.equal("DELIVERED");
      expect(res.body.pagination).to.include({ total: 1, page: 1, limit: 1 });
    });

    it("rechaza un objectId inválido en el filtro user", async () => {
      const res = await request(app).get("/api/v1/orders?user=not-an-id");

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("status", "fail");
    });
  });

  describe("GET /api/v1/mocks", () => {
    it("limita la cantidad de datos simulados generados por request", async () => {
      const res = await request(app).get("/api/v1/mocks/users?qty=101");

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "Argumento inválido o faltante",
      });
    });
  });
});
