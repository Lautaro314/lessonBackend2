const request = require("supertest");
const { expect } = require("chai");
const fs = require("fs");
const path = require("path");
const app = require("../src/app.js");
const OrderModel = require("../src/models/order.model.js");
const { UPLOADS_ROOT } = require("../src/config/multer.config.js");
const { cleanDatabase, createUser, buildOrderData } = require("./helpers.js");

const pngBuffer = Buffer.from("contenido-simulado-de-imagen");

const attachDocument = (req, buffer = pngBuffer, options = {}) =>
  req.attach("document", buffer, {
    filename: options.filename || "dni.png",
    contentType: options.contentType || "image/png",
  });

const attachReceipt = (req, buffer = pngBuffer, options = {}) =>
  req.attach("receipt", buffer, {
    filename: options.filename || "comprobante.pdf",
    contentType: options.contentType || "application/pdf",
  });

describe("Uploads - documentos y comprobantes", () => {
  let user;

  beforeEach(async () => {
    await cleanDatabase();
    // Limpiamos la carpeta de uploads del entorno de testing
    fs.rmSync(UPLOADS_ROOT, { recursive: true, force: true });
    user = await createUser({ email: "documentos@shipnow.test" });
  });

  describe("POST /api/v1/users/:id/documents", () => {
    it("carga un documento válido y registra los metadatos en el usuario", async () => {
      const res = await attachDocument(
        request(app)
          .post(`/api/v1/users/${user._id}/documents`)
          .field("document_type", "DNI")
      );

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("status", "success");
      expect(res.body.payload.documents).to.be.an("array").with.lengthOf(1);

      const doc = res.body.payload.documents[0];
      expect(doc).to.include.keys(
        "original_name",
        "filename",
        "path",
        "mimetype",
        "size",
        "document_type",
        "uploaded_at"
      );
      expect(doc.original_name).to.equal("dni.png");
      expect(doc.document_type).to.equal("DNI");
      expect(doc.mimetype).to.equal("image/png");
      expect(doc.path).to.match(/^users\//);

      // El archivo existe realmente en el disco (solo los metadatos van a la base)
      const stored = path.join(UPLOADS_ROOT, doc.path);
      expect(fs.existsSync(stored)).to.equal(true);
    });

    it("guarda los documentos de tipo LICENSE en la carpeta licenses", async () => {
      const res = await attachDocument(
        request(app)
          .post(`/api/v1/users/${user._id}/documents`)
          .field("document_type", "LICENSE")
      );

      expect(res.status).to.equal(201);
      expect(res.body.payload.documents[0].path).to.match(/^licenses\//);
    });

    it("devuelve 400 con el formato de error si falta el archivo", async () => {
      const res = await request(app)
        .post(`/api/v1/users/${user._id}/documents`)
        .field("document_type", "DNI");

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "El archivo es obligatorio",
      });
    });

    it("devuelve 400 con el formato de error si el tipo de documento es inválido", async () => {
      const res = await attachDocument(
        request(app)
          .post(`/api/v1/users/${user._id}/documents`)
          .field("document_type", "TIPO_INVALIDO")
      );

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "El tipo de documento no es válido",
      });

      // El archivo subido se elimina para no quedar huérfano
      const usersDir = path.join(UPLOADS_ROOT, "users");
      const files = fs.existsSync(usersDir) ? fs.readdirSync(usersDir) : [];
      expect(files).to.have.lengthOf(0);
    });

    it("devuelve 400 con el formato de error si el tipo de archivo no está permitido", async () => {
      const res = await attachDocument(
        request(app)
          .post(`/api/v1/users/${user._id}/documents`)
          .field("document_type", "DNI"),
        Buffer.from("texto plano"),
        { filename: "nota.txt", contentType: "text/plain" }
      );

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "El tipo de archivo no está permitido",
      });
    });

    it("devuelve 400 con el formato de error si el archivo supera el tamaño máximo", async () => {
      const bigBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024, 1);

      const res = await attachDocument(
        request(app)
          .post(`/api/v1/users/${user._id}/documents`)
          .field("document_type", "DNI"),
        bigBuffer,
        { filename: "grande.png", contentType: "image/png" }
      );

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "El archivo supera el tamaño máximo permitido (5MB)",
      });
    });

    it("devuelve 400 con el formato de error si el campo enviado no es el esperado", async () => {
      const res = await request(app)
        .post(`/api/v1/users/${user._id}/documents`)
        .field("document_type", "DNI")
        .attach("archivo", pngBuffer, { filename: "dni.png", contentType: "image/png" });

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "El campo enviado no es el esperado",
      });
    });

    it("devuelve 404 con el formato de error si el usuario no existe", async () => {
      const res = await attachDocument(
        request(app)
          .post("/api/v1/users/64b7f0c2f1a2b3c4d5e6f7a8/documents")
          .field("document_type", "DNI")
      );

      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "El usuario solicitado no existe",
      });
    });
  });

  describe("POST /api/v1/orders/:id/receipts", () => {
    let order;

    beforeEach(async () => {
      order = await OrderModel.create(buildOrderData(user._id));
    });

    it("carga un comprobante válido y lo asocia al pedido", async () => {
      const res = await attachReceipt(
        request(app).post(`/api/v1/orders/${order._id}/receipts`)
      );

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("status", "success");
      expect(res.body.payload.receipts).to.be.an("array").with.lengthOf(1);

      const receipt = res.body.payload.receipts[0];
      expect(receipt).to.include.keys("original_name", "filename", "path", "mimetype", "size");
      expect(receipt.original_name).to.equal("comprobante.pdf");
      expect(receipt.path).to.match(/^receipts\//);

      const stored = path.join(UPLOADS_ROOT, receipt.path);
      expect(fs.existsSync(stored)).to.equal(true);
    });

    it("devuelve 400 con el formato de error si falta el archivo", async () => {
      const res = await request(app).post(`/api/v1/orders/${order._id}/receipts`);

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "El archivo es obligatorio",
      });
    });

    it("devuelve 404 con el formato de error si el pedido no existe", async () => {
      const res = await attachReceipt(
        request(app).post("/api/v1/orders/64b7f0c2f1a2b3c4d5e6f7a8/receipts")
      );

      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({
        status: "fail",
        error: "El pedido solicitado no existe",
      });
    });
  });
});
