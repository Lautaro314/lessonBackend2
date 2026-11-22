const deliveryService = require("../services/delivery.service.js");
const { sendPaginated } = require("../utils/pagination.util.js");

const getDeliveries = async (req, res, next) => {
  try {
    const result = await deliveryService.getDeliveries(req.query, req.pagination);
    sendPaginated(res, result, req.pagination);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDeliveries };
