const orderRepository = require("../repositories/order.repository.js");
const { ORDER_STATUS } = require("../constants/index.js");
const { ERROR_TYPES } = require("../constants/error.enums.js");
const CustomError = require("../utils/errors/custom-error.js");

const calculateTotalPrice = (items = []) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const validateStatus = (status) => {
  if (status !== undefined && !Object.values(ORDER_STATUS).includes(status)) {
    throw new CustomError(ERROR_TYPES.INVALID_STATUS);
  }
};

const getOrders = async () => {
  return await orderRepository.findAll();
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

module.exports = { getOrders, createOrder, getOrderById, updateOrder, deleteOrder };
