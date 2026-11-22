const DeliveryModel = require("../models/delivery.model.js");

class DeliveryRepository {
  async createMany(deliveriesData) {
    return await DeliveryModel.insertMany(deliveriesData);
  }

  async findPaginated(filters = {}, { skip, limit }) {
    const query = { isDeleted: false, ...filters };
    const [items, total] = await Promise.all([
      DeliveryModel.find(query).sort({ _id: -1 }).skip(skip).limit(limit).lean(),
      DeliveryModel.countDocuments(query),
    ]);
    return { items, total };
  }
}

module.exports = new DeliveryRepository();