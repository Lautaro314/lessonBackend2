const orderRepository = require("../repositories/order.repository.js");
const { ORDER_STATUS, ORDER_PRIORITY } = require("../constants/index.js");
const { ERROR_TYPES } = require("../constants/error.enums.js");
const CustomError = require("../utils/errors/custom-error.js");
const { buildFileMetadata, removeUploadedFile } = require("../utils/file.util.js");
const { buildSafeFilters } = require("../utils/query-filters.util.js");
const logger = require("../config/logger.config.js");

const ORDER_FILTERS = Object.freeze({
  user: "objectId",
  status: Object.values(ORDER_STATUS),
  priority: Object.values(ORDER_PRIORITY),
});

const calculateTotalPrice = (items = []) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const validateStatus = (status) => {
  if (status !== undefined && !Object.values(ORDER_STATUS).includes(status)) {
    throw new CustomError(ERROR_TYPES.INVALID_STATUS);
  }
};

const getOrders = async (query, pagination) => {
  const filters = buildSafeFilters(query, ORDER_FILTERS);
  return await orderRepository.findPaginated(filters, pagination);
};

const createOrder = async (orderData) => {
  if (!orderData.items || orderData.items.length === 0) {
    throw new CustomError(ERROR_TYPES.INVALID_ARGUMENT);
  }

  validateStatus(orderData.status);

  const totalPrice = calculateTotalPrice(orderData.items);
  return await orderRepository.create({ ...orderData, total: totalPrice });
};

const getOrderById = async (id) => {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new CustomError(ERROR_TYPES.ORDER_NOT_FOUND);
  }
  return order;
};

const updateOrder = async (id, orderData) => {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new CustomError(ERROR_TYPES.ORDER_NOT_FOUND);
  }

  validateStatus(orderData.status);

  if (orderData.items) {
    orderData.total = calculateTotalPrice(orderData.items);
  }

  return await orderRepository.update(id, orderData);
};

const deleteOrder = async (id) => {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new CustomError(ERROR_TYPES.ORDER_NOT_FOUND);
  }
  return await orderRepository.softDelete(id);
};

// Asocia un comprobante a un pedido y registra sus metadatos
const addOrderReceipt = async (orderId, file) => {
  try {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new CustomError(ERROR_TYPES.ORDER_NOT_FOUND);
    }

    if (!file) {
      throw new CustomError(ERROR_TYPES.FILE_REQUIRED);
    }

    const metadata = buildFileMetadata(file, "RECEIPT");

    const updated = await orderRepository.addReceipt(orderId, metadata);
    if (!updated) {
      throw new CustomError(ERROR_TYPES.FILE_SAVE_ERROR);
    }

    logger.info(
      `Comprobante asociado al pedido ${orderId}: ${metadata.filename}`
    );

    return updated;
  } catch (error) {
    if (file) {
      removeUploadedFile(file);
    }
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(ERROR_TYPES.FILE_SAVE_ERROR);
  }
};

module.exports = {
  getOrders,
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
  addOrderReceipt,
};
