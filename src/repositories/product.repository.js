const ProductModel = require("../models/product.model.js");

class ProductRepository {
  async findPaginated(filters = {}, { skip, limit }) {
    // Encapsula el filtro por defecto de no eliminados
    const query = { isDeleted: false, ...filters };
    const [items, total] = await Promise.all([
      ProductModel.find(query).sort({ _id: -1 }).skip(skip).limit(limit).lean(),
      ProductModel.countDocuments(query),
    ]);
    return { items, total };
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