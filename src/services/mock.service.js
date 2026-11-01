const { faker } = require("@faker-js/faker");
const mockFactory = require("../mocks/mock.factory.js");
const { ROLES } = require("../constants/index.js");
const { ERROR_TYPES } = require("../constants/error.enums.js");
const CustomError = require("../utils/errors/custom-error.js");
const userRepository = require("../repositories/user.repository.js");
const orderRepository = require("../repositories/order.repository.js");
const deliveryRepository = require("../repositories/delivery.repository.js");

class MockService {
  validateQty(qty) {
    const parsedQty = Number(qty);
    if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
      throw new CustomError(ERROR_TYPES.INVALID_ARGUMENT);
    }
    return parsedQty;
  }

  getMockUsers(qty) {
    const validQty = this.validateQty(qty);
    const users = [];
    for (let i = 0; i < validQty; i++) {
      users.push(mockFactory.generateUser());
    }
    return users;
  }

  getMockOrders(qty) {
    const validQty = this.validateQty(qty);
    const orders = [];
    for (let i = 0; i < validQty; i++) {
      orders.push(mockFactory.generateOrder(faker.database.mongodbObjectId()));
    }
    return orders;
  }

  async seedDatabase(qty) {
    try {
      const validQty = this.validateQty(qty);

      const usersToCreate = [];
      for (let i = 0; i < validQty; i++) {
        const role = i % 4 === 0 ? ROLES.DELIVERY : ROLES.USER;
        usersToCreate.push(mockFactory.generateUser(role));
      }
      const insertedUsers = await userRepository.createMany(usersToCreate);

      const clients = insertedUsers.filter((u) => u.role === ROLES.USER);
      const drivers = insertedUsers.filter((u) => u.role === ROLES.DELIVERY);
      const availableDrivers = drivers.length > 0 ? drivers : insertedUsers;

      const ordersToCreate = [];
      for (let i = 0; i < validQty; i++) {
        const randomClient = faker.helpers.arrayElement(clients.length > 0 ? clients : insertedUsers);
        ordersToCreate.push(mockFactory.generateOrder(randomClient._id));
      }
      const insertedOrders = await orderRepository.createMany(ordersToCreate);

      const deliveriesToCreate = [];
      for (let i = 0; i < insertedOrders.length; i++) {
        const order = insertedOrders[i];
        const randomDriver = faker.helpers.arrayElement(availableDrivers);
        deliveriesToCreate.push(mockFactory.generateDelivery(order._id, randomDriver._id));
      }
      const insertedDeliveries = await deliveryRepository.createMany(deliveriesToCreate);

      return {
        insertados: insertedUsers.length + insertedOrders.length + insertedDeliveries.length,
        detalle: {
          usuarios: insertedUsers.length,
          pedidos: insertedOrders.length,
          entregas: insertedDeliveries.length,
        },
      };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(ERROR_TYPES.DATABASE_ERROR);
    }
  }
}

module.exports = new MockService();



