const OrderModel = require("../models/order.model.js");

class OrderRepository {
  async createMany(ordersData) {
    return await OrderModel.insertMany(ordersData);
  }

  async findPaginated(filters = {}, { skip, limit }) {
    const query = { isDeleted: false, ...filters };
    const [items, total] = await Promise.all([
      OrderModel.find(query).sort({ _id: -1 }).skip(skip).limit(limit).lean(),
      OrderModel.countDocuments(query),
    ]);
    return { items, total };
  }

  async findById(id) {
    return await OrderModel.findOne({ _id: id, isDeleted: false }).lean();
  }

  async create(orderData) {
    return await OrderModel.create(orderData);
  }

  async update(id, updateData) {
    return await OrderModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    );
  }

  async softDelete(id) {
    return await OrderModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
  }

  // Registra los metadatos de un comprobante en la entidad pedido
  async addReceipt(id, receiptMetadata) {
    return await OrderModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $push: { receipts: receiptMetadata } },
      { new: true }
    );
  }
}

module.exports = new OrderRepository();
