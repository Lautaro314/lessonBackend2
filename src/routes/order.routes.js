const express = require('express');
const router = express.Router();
const {
    getOrders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
    uploadOrderReceipt,
} = require('../controllers/order.controller');
const { uploadOrderReceipt: uploadReceiptMiddleware } = require('../config/multer.config.js');

router.get('/' , getOrders)
router.post('/' , createOrder)
router.get('/:id' , getOrderById)
router.put('/:id' , updateOrder)
router.delete('/:id' , deleteOrder)

// Carga de comprobantes del pedido (multipart/form-data, campo "receipt")
router.post('/:id/receipts', uploadReceiptMiddleware, uploadOrderReceipt)

module.exports = router;
