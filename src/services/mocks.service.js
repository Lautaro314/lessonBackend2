const { generateMockOrders } = require("../controllers/mocks.controller");
const {generateMockUsers} = require("../mocks/users.mock")

const productNames = [
    "Product 1",
    "Product 2",
    "Product 3",
    "Product 4",
    "Product 5"
];

const getRandomItem = () => {
    return productNames[Math.floor(Math.random() * productNames.length)];
};

const generateMockOrder = (customerId) => {
    const items = [
        {
            name: getRandomItem(),
            quantity: Math.floor(Math.random() * 5) + 1,
            price: parseFloat((Math.random() * 20).toFixed(2))
        }
    ];


const totalPrice = items.reduce((total, item) => total + item.quantity * item.price, 0);

return {
    customer: customerId,
    items: items,
    totalPrice: totalPrice,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date()
}

}

const generateUsers= () => {
    return generateMockUsers();
}

const generateData = async (usersCount , ordersCount) => {
    const users = generateMockUsers(usersCount);

    const orders = [];

    for (let i = 0; i < ordersCount; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        orders.push(generateMockOrders)
    }

    return {
        users,
        orders
    };
}

module.exports = { generateMockOrder , generateUsers , generateData}




