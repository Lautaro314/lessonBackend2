// src/controllers/product.controller.js
const productService = require("../services/product.service.js");

class ProductController {
  getProducts = async (req, res, next) => {
    try {
      const products = await productService.getAllProducts(req.query);
      res.status(200).json({ status: "success", payload: products });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      res.status(200).json({ status: "success", payload: product });
    } catch (error) {
      res.status(404).json({ status: "error", message: error.message });
    }
  };

  createProduct = async (req, res, next) => {
    try {
      const newProduct = await productService.createProduct(req.body);
      res.status(201).json({ status: "success", payload: newProduct });
    } catch (error) {
      res.status(400).json({ status: "error", message: error.message });
    }
  };

  updateProduct = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedProduct = await productService.updateProduct(id, req.body);
      res.status(200).json({ status: "success", payload: updatedProduct });
    } catch (error) {
      res.status(400).json({ status: "error", message: error.message });
    }
  };

  deleteProduct = async (req, res, next) => {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);
      res.status(200).json({ status: "success", message: "Producto eliminado correctamente" });
    } catch (error) {
      res.status(404).json({ status: "error", message: error.message });
    }
  };
}

module.exports = new ProductController();