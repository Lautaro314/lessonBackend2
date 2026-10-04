const orderService = require('../services/order.service')

const getOrders = async (req , res) => {
    try {
        const orders = await orderService.getOrders();
        res.json({status:'success' , payload: orders})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const createOrder = async (req, res) => {
    try {
        const orderData = req.body;
        const newOrder = await orderService.createOrder(orderData);
        res.status(201).json({status:'success' , payload: newOrder})
    } catch(error) {
        console.error(error);
        console.error(error.stack);
        res.status(500).json({error: error.message})
    }
}

const getOrderById = async (req, res) => {
    try{
        const {id} = req.params;
        const order = await orderService.getOrderById(id);
        if(!order) {
            return res.status(404).json({error:'Orden no encontrada'})
        }
        res.json({status:'success', payload: order})
    }catch(error) {
        res.status(500).json({error: error.message})
    }
}

const updateOrder = async (req , res) => {
    try {
        const {id} = req.params;
        const orderData = req.body;
        const updateOrder = await orderService.updateOrder(id, orderData);
        if(!updateOrder) {
            return res.status(404).json({error:'Orden no encontrada'})
        }
        res.json({status:'success' , payload: updateOrder})
    }catch (error) {
        res.status(500).json({error: error.message})
    }
}

const deleteOrder = async (req , res) => {
    try{
        const {id} = req.params;
        const deleteOrder = await orderService.deleteOrder(id);
        if(!deleteOrder) {
            return res.status(404).json({error:'Orden no encontrada'})
        }
        res.json({status:'success' , payload: deleteOrder})
    }catch (error) {
        res.status(500).json({error: error.message})
    }
}

module.exports = {getOrders, createOrder , getOrderById, updateOrder, deleteOrder}