// src/controllers/mock.controller.js
const mockService = require('../services/mock.service');

class MockController {
  generateMockOrders = async (req, res, next) => {
    try {
      const qty = parseInt(req.query.qty) || 10;
      const orders = await mockService.getMockOrders(qty);
      res.status(200).json({ status: 'success', payload: orders });
    } catch (error) {
      next(error);
    }
  };

  generateUsers = async (req, res, next) => {
    try {
      const qty = parseInt(req.query.qty) || 10;
      const users = await mockService.getMockUsers(qty);
      res.status(200).json({ status: 'success', payload: users });
    } catch (error) {
      next(error);
    }
  };

  generateData = async (req, res, next) => {
    try {
      const qty = parseInt(req.query.qty) || 10;
      const result = await mockService.seedDatabase(qty);
      res.status(201).json({ status: 'success', payload: result });
    } catch (error) {
      next(error);
    }
  };
}

// ⚠️ IMPORTANTE: Exportar la INSTANCIA creada con 'new'
module.exports = new MockController();