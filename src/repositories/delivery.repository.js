const DeliveryModel = require("../models/delivery.model.js");

class DeliveryRepository {
  async createMany(deliveriesData) {
    return await DeliveryModel.insertMany(deliveriesData);
  }
}

module.exports = new DeliveryRepository();