const express = require('express');
const router = express.Router();
const mocksController = require('../controllers/mock.controller');

router.get('/mockingorders', mocksController.generateMockOrders);
router.get('/mockingusers', mocksController.generateUsers)
router.post('/generateData',mocksController.generateData)

module.exports = router;

