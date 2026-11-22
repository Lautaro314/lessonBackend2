const orderService = require("../services/order.service");
const { sendPaginated } = require("../utils/pagination.util.js");

const getOrders = async (req, res, next) => {
    try {
        const result = await orderService.getOrders(req.query, req.pagination);
        sendPaginated(res, result, req.pagination);
    } catch (error) {
        next(error);
    }
};

const createOrder = async (req, res, next) => {
    try {
        const orderData = req.body;
        const newOrder = await orderService.createOrder(orderData);
        res.status(201).json({ status: "success", payload: newOrder });
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await orderService.getOrderById(id);
        res.json({ status: "success", payload: order });
    } catch (error) {
        next(error);
    }
};

const updateOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const orderData = req.body;
        const updatedOrder = await orderService.updateOrder(id, orderData);
        res.json({ status: "success", payload: updatedOrder });
    } catch (error) {
        next(error);
    }
};

const deleteOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedOrder = await orderService.deleteOrder(id);
        res.json({ status: "success", payload: deletedOrder });
    } catch (error) {
        next(error);
    }
};

const uploadOrderReceipt = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedOrder = await orderService.addOrderReceipt(id, req.file);
        res.status(201).json({ status: "success", payload: updatedOrder });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOrders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
    uploadOrderReceipt,
};
