const express = require('express');
const router = express.Router();
const {getOrders, createOrder, getOrderById, updateOrder, deleteOrder} = require('../controllers/order.controller')

router.get('/' , getOrders)
router.post('/' , createOrder)
router.get('/:id' , getOrderById)
router.put('/:id' , updateOrder)
router.delete('/:id' , deleteOrder)

module.exports = router;