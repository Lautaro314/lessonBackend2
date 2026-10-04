const productRepository = require("../repositories/product.repository.js");
const { PRODUCT_STATUS } = require("../constants/index.js");

class ProductService {
  async getAllProducts(filters) {
    return await productRepository.findAll(filters);
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error("Producto no encontrado");
    }
    return product;
  }

  async createProduct(productData) {
    if (!productData.name || productData.price == null) {
      throw new Error("El nombre y el precio son obligatorios");
    }

    // Regla de negocio: asignar estado dinámico según el stock inicial
    const stock = Number(productData.stock) || 0;
    const status = stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK;

    const newProductData = {
      ...productData,
      stock,
      status,
    };

    return await productRepository.create(newProductData);
  }

  async updateProduct(id, updateData) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error("Producto no encontrado");
    }

    // Regla de negocio: si actualizan stock, ajustar estado automáticamente
    if (updateData.stock !== undefined) {
      const stock = Number(updateData.stock);
      if (stock < 0) {
        throw new Error("El stock no puede ser negativo");
      }
      updateData.status = stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK;
    }

    return await productRepository.update(id, updateData);
  }

  async deleteProduct(id) {
    const deleted = await productRepository.softDelete(id);
    if (!deleted) {
      throw new Error("Producto no encontrado o ya fue eliminado");
    }
    return deleted;
  }
}

module.exports = new ProductService();