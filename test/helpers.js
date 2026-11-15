const UserModel = require("../src/models/user.model.js");
const OrderModel = require("../src/models/order.model.js");
const DeliveryModel = require("../src/models/delivery.model.js");

// Limpia todas las colecciones generadas por los tests.
const cleanDatabase = async () => {
  await Promise.all([
    UserModel.deleteMany({}),
    OrderModel.deleteMany({}),
    DeliveryModel.deleteMany({}),
  ]);
};

let counter = 0;
const uniqueEmail = () =>
  `test-${Date.now()}-${counter++}@shipnow.test`;

// Crea un usuario controlado directamente en la base de testing.
const createUser = async (overrides = {}) => {
  return await UserModel.create({
    first_name: "Test",
    last_name: "User",
    email: uniqueEmail(),
    password: "password123",
    role: "USER",
    ...overrides,
  });
};

// Datos válidos y repetibles para crear un pedido.
const buildOrderData = (userId, overrides = {}) => ({
  user: userId,
  items: [{ product_name: "Caja mediana", quantity: 2, price: 100 }],
  total: 200,
  shipping_address: "Av. Siempre Viva 742",
  ...overrides,
});

module.exports = { cleanDatabase, createUser, buildOrderData, uniqueEmail };
