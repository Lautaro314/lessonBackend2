const mockFactory = require("../mocks/mock.factory.js");
const { ROLES } = require("../constants/index.js");
const UserModel = require("../models/user.model.js");

class MockService {
  
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
      orders.push(mockFactory.generateOrder());
    }
    return orders;
  }

  
  async seedDatabase(qty = 10) {
    const usersToCreate = [];
    for (let i = 0; i < qty; i++) {
      const role = i % 3 === 0 ? ROLES.DELIVERY : ROLES.USER;
      usersToCreate.push(mockFactory.generateUser(role));
    }

    const insertedUsers = await UserModel.insertMany(usersToCreate);

    return {
      insertados: insertedUsers.length,
      coleccion: "usuarios",
      detalle: {
        usuarios_comunes: insertedUsers.filter((u) => u.role === ROLES.USER).length,
        repartidores: insertedUsers.filter((u) => u.role === ROLES.DELIVERY).length,
      },
    };
  }
}

module.exports = new MockService();



