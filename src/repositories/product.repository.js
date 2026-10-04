const ProductModel = require("../models/product.model.js");

class ProductRepository {
  async findAll(filters = {}) {
    // Encapsula el filtro por defecto de no eliminados
    return await ProductModel.find({ isDeleted: false, ...filters }).lean();
  }

  async findById(id) {
    return await ProductModel.findOne({ _id: id, isDeleted: false }).lean();
  }

  async create(productData) {
    return await ProductModel.create(productData);
  }

  async update(id, updateData) {
    return await ProductModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    );
  }

  async softDelete(id) {
    return await ProductModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
  }
}

module.exports = new ProductRepository();