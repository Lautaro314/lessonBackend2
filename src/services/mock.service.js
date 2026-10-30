// src/services/mock.service.js
const { faker } = require("@faker-js/faker");
const mockFactory = require("../mocks/mock.factory.js");
const { ROLES } = require("../constants/index.js");
const userRepository = require("../repositories/user.repository.js");
const orderRepository = require("../repositories/order.repository.js");
const deliveryRepository = require("../repositories/delivery.repository.js");

class MockService {
  // Datos simulados sin guardar en DB
  getMockUsers(qty = 10) {
    const users = [];
    for (let i = 0; i < qty; i++) {
      users.push(mockFactory.generateUser());
    }
    return users;
  }

  getMockOrders(qty = 10) {
    const orders = [];
    for (let i = 0; i < qty; i++) {
      orders.push(mockFactory.generateOrder(faker.database.mongodbObjectId()));
    }
    return orders;
  }

  // CARGA MASIVA (SEED) CON DATOS DEPENDIENTES INTEGRANDO REPOSITORIOS
  async seedDatabase(qty = 10) {
    // 1. Crear y guardar Usuarios y Repartidores
    const usersToCreate = [];
    for (let i = 0; i < qty; i++) {
      // Asignamos rol DELIVERY a algunos usuarios para tener repartidores reales
      const role = i % 4 === 0 ? ROLES.DELIVERY : ROLES.USER;
      usersToCreate.push(mockFactory.generateUser(role));
    }
    const insertedUsers = await userRepository.createMany(usersToCreate);

    // Separamos clientes y repartidores de los usuarios ya insertados en la base
    const clients = insertedUsers.filter((u) => u.role === ROLES.USER);
    const drivers = insertedUsers.filter((u) => u.role === ROLES.DELIVERY);
    const availableDrivers = drivers.length > 0 ? drivers : insertedUsers;

    // 2. Crear Pedidos DEPENDIENTES de los IDs de clientes reales creados en el paso 1
    const ordersToCreate = [];
    for (let i = 0; i < qty; i++) {
      const randomClient = faker.helpers.arrayElement(clients.length > 0 ? clients : insertedUsers);
      ordersToCreate.push(mockFactory.generateOrder(randomClient._id));
    }
    const insertedOrders = await orderRepository.createMany(ordersToCreate);

    // 3. Crear Entregas DEPENDIENTES de los IDs de pedidos y de repartidores reales
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
  }
}

module.exports = new MockService();



