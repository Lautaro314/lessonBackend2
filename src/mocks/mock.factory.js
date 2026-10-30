const { faker } = require("@faker-js/faker");
const { ROLES, ORDER_STATUS, ORDER_PRIORITY } = require("../constants/index.js");

class MockFactory {
  generateUser(customRole = null) {
    const role = customRole || faker.helpers.arrayElement([ROLES.USER, ROLES.ADMIN]);
    return {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      password: "password123",
      role,
      isDeleted: false,
    };
  }

  // Genera un pedido dependiente de un ID de usuario real
  generateOrder(userId) {
    return {
      user: userId, 
      items: [
        {
          product_name: faker.commerce.productName(),
          quantity: faker.number.int({ min: 1, max: 5 }),
          price: parseFloat(faker.commerce.price({ min: 1000, max: 30000 })),
        },
      ],
      total: parseFloat(faker.commerce.price({ min: 5000, max: 100000 })),
      status: faker.helpers.arrayElement(Object.values(ORDER_STATUS)),
      priority: faker.helpers.arrayElement(Object.values(ORDER_PRIORITY)),
      shipping_address: faker.location.streetAddress({ useFullAddress: true }),
      isDeleted: false,
    };
  }

  // Genera una entrega dependiente de un ID de pedido y un ID de repartidor real
  generateDelivery(orderId, driverId) {
    return {
      order: orderId,
      delivery_driver: driverId,
      tracking_code: faker.string.alphanumeric(10).toUpperCase(),
      status: faker.helpers.arrayElement(Object.values(ORDER_STATUS)),
      isDeleted: false,
    };
  }
}

module.exports = new MockFactory();