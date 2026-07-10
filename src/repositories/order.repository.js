const Order = require('../models/order.model');

const getOrders = async () => {
    return await Order.findAll();
}

const createOrder = async (orderData) => {
    return await Order.create(orderData);
}

const getOrderById = async (id) => {
    return await Order.findByPk(id);
}

const updateOrder = async (id , orderData) => {
    return await Order.findByPk(id);
}

const deleteOrder = async (id) => {
    return await Order.findByPk(id);
}

module.exports = {getOrders , createOrder , getOrderById , updateOrder , deleteOrder}