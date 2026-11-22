const deliveryRepository = require("../repositories/delivery.repository.js");
const { ORDER_STATUS } = require("../constants/index.js");
const { buildSafeFilters } = require("../utils/query-filters.util.js");

const DELIVERY_FILTERS = Object.freeze({
  order: "objectId",
  delivery_driver: "objectId",
  status: Object.values(ORDER_STATUS),
});

const getDeliveries = async (query, pagination) => {
  const filters = buildSafeFilters(query, DELIVERY_FILTERS);
  return await deliveryRepository.findPaginated(filters, pagination);
};

module.exports = { getDeliveries };
