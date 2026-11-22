const { Router } = require("express");
const productController = require("../controllers/product.controller.js");
const paginate = require("../middleware/pagination.middleware.js");

const router = Router();

router.get("/", paginate, productController.getProducts);
router.get("/:id", productController.getProductById);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;