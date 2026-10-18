// src/mocks/mock.factory.js
const { faker } = require("@faker-js/faker");
const { ROLES, ORDER_STATUS, ORDER_PRIORITY } = require("../constants/index.js");

class MockFactory {
  // Generar usuarios o repartidores simulados
  generateUser(customRole = null) {
    const rolesArray = [ROLES.USER, ROLES.ADMIN];
    const role = customRole || faker.helpers.arrayElement(rolesArray);

    return {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      password: "password123", // Contraseña genérica para mocks
      role,
      isDeleted: false,
    };
  }

  // Generar un pedido simulado (opcionalmente vinculado a un usuario)
  generateOrder(userId = null) {
    return {
      user: userId || faker.database.mongodbObjectId(),
      items: [
        {
          product_name: faker.commerce.productName(),
          quantity: faker.number.int({ min: 1, max: 5 }),
          price: parseFloat(faker.commerce.price({ min: 1000, max: 50000 })),
        },
      ],
      total: parseFloat(faker.commerce.price({ min: 5000, max: 150000 })),
      status: faker.helpers.arrayElement(Object.values(ORDER_STATUS)),
      priority: faker.helpers.arrayElement(Object.values(ORDER_PRIORITY)),
      shipping_address: faker.location.streetAddress({ useFullAddress: true }),
    };
  }

  // Generar una entrega vinculada a un pedido y repartidor
  generateDelivery(orderId = null, deliveryDriverId = null) {
    return {
      order: orderId || faker.database.mongodbObjectId(),
      delivery_driver: deliveryDriverId || faker.database.mongodbObjectId(),
      tracking_code: faker.string.alphanumeric(10).toUpperCase(),
      status: faker.helpers.arrayElement(Object.values(ORDER_STATUS)),
      estimated_delivery: faker.date.future(),
    };
  }
}

module.exports = new MockFactory();