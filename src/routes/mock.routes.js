// src/routes/mock.routes.js
const { Router } = require("express");
const mockController = require("../controllers/mock.controller.js");

const router = Router();

// Endpoints que devuelven datos simulados sin guardar en DB
router.get("/users", mockController.getMockUsers);
router.get("/orders", mockController.getMockOrders);

// Endpoint que inserta registros relacionados en MongoDB
router.post("/seed", mockController.seedDatabase);

module.exports = router;

