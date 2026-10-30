// src/controllers/mock.controller.js
const mockService = require("../services/mock.service.js");

class MockController {
  getMockUsers = async (req, res, next) => {
    try {
      const qty = parseInt(req.query.qty) || 10;
      const users = mockService.getMockUsers(qty);
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  getMockOrders = async (req, res, next) => {
    try {
      const qty = parseInt(req.query.qty) || 10;
      const orders = mockService.getMockOrders(qty);
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  };

  seedDatabase = async (req, res, next) => {
    try {
      const qty = parseInt(req.query.qty) || 10;
      const result = await mockService.seedDatabase(qty);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new MockController();