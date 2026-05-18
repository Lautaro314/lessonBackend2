const express = require("express");
const router = express.Router();

const { processProducts } = require("../controllers/product.controller");

router.get("/process", processProducts);

module.exports = router;