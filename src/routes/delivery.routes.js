// src/routes/delivery.routes.js
const { Router } = require("express");
const paginate = require("../middleware/pagination.middleware.js");
const { getDeliveries } = require("../controllers/delivery.controller.js");

const router = Router();

router.get("/", paginate, getDeliveries);

module.exports = router;
