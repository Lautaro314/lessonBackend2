const request = require("supertest");
const { expect } = require("chai");
const app = require("../src/app.js");
const UserModel = require("../src/models/user.model.js");
const { cleanDatabase, createUser } = require("./helpers.js");

describe("Usuarios - /api/v1/users", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("GET /api/v1/users", () => {
    it("devuelve 200 con un listado de usuarios", async () => {
      await createUser({ email: "uno@shipnow.test" });
      await createUser({ email: "dos@shipnow.test" });

      const res = await request(app).get("/api/v1/users");

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property("payload").that.is.an("array").with.lengthOf(2);

      const user = res.body.payload[0];
      expect(user).to.include.keys("_id", "first_name", "last_name", "email", "role");
      expect(user).to.not.have.property("password");
    });

    it("devuelve 200 con un array vacío cuando no hay usuarios", async () => {
      const res = await request(app).get("/api/v1/users");

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.be.an("array").with.lengthOf(0);
    });
  });

  describe("GET /api/v1/users/:id", () => {
    it("devuelve 200 con el usuario solicitado", async () => {
      const user = await createUser({ email: "buscar@shipnow.test" });

      const res = await request(app).get(`/api/v1/users/${user._id}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body.payload).to.have.property("_id", user._id.toString());
      expect(res.body.payload).to.have.property("email", "buscar@shipnow.test");
    });

    it("devuelve 404 con el formato de error si el usuario no existe", async () => {
      const res = await request(app).get("/api/v1/users/64b7f0c2f1a2b3c4d5e6f7a8");

      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "El usuario solicitado no existe",
      });
    });
  });

  describe("POST /api/v1/users", () => {
    it("crea un usuario válido y devuelve 201", async () => {
      const res = await request(app).post("/api/v1/users").send({
        first_name: "Nuevo",
        last_name: "Usuario",
        email: "nuevo@shipnow.test",
        password: "secret123",
      });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("status", "success");
      expect(res.body.payload).to.have.property("email", "nuevo@shipnow.test");
      expect(res.body.payload).to.have.property("role", "USER");
      expect(res.body.payload).to.not.have.property("password");

      const persisted = await UserModel.findOne({ email: "nuevo@shipnow.test" });
      expect(persisted).to.not.equal(null);
    });

    it("devuelve 400 con el formato de error si faltan datos", async () => {
      const res = await request(app).post("/api/v1/users").send({
        first_name: "Sin",
        last_name: "Credenciales",
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "Argumento inválido o faltante",
      });
    });

    it("devuelve 400 con el formato de error si el email ya existe", async () => {
      await createUser({ email: "repetido@shipnow.test" });

      const res = await request(app).post("/api/v1/users").send({
        first_name: "Otro",
        last_name: "Usuario",
        email: "repetido@shipnow.test",
        password: "secret123",
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "El correo electrónico ya se encuentra registrado",
      });
    });
  });
});
