const OrderModel = require("../models/order.model.js");

class OrderRepository {
  async createMany(ordersData) {
    return await OrderModel.insertMany(ordersData);
  }

  async findAll(filters = {}) {
    return await OrderModel.find({ isDeleted: false, ...filters }).lean();
  }

  async findById(id) {
    return await OrderModel.findOne({ _id: id, isDeleted: false }).lean();
  }
}

module.exports = new OrderRepository();