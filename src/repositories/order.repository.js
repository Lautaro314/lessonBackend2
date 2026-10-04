const Order = require("../models/order.model");

const getOrders = async () => {
    return await Order.findAll();
};

const createOrder = async (orderData) => {
    return await Order.create(orderData);
};

const getOrderById = async (id) => {
    return await Order.findByPk(id);
};

const updateOrder = async (id, orderData) => {
    const order = await Order.findByPk(id);

    if (!order) return null;

    return await order.update(orderData);
};

const deleteOrder = async (id) => {
    const order = await Order.findByPk(id);

    if (!order) return null;

    await order.destroy();

    return order;
};

module.exports = {
    getOrders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder
};