const {ordersRepository} = require('../repositories/order.repository');
const usersRepository = require('../repositories/users.repository')

const calculateTotalPrice = (products) => {
    return products.reduce((total, product) => total + product.price * product.quantity, 0);
}

const getOrders = async () => {
    return await ordersRepository.getOrders()
};

const createOrder = async (orderData) => {
    const user = await usersRepository.getUserById(orderData.userId);
    if (!user) {
        throw new Error('Usuario no encontrado');
    }
    const totalPrice = calculateTotalPrice(orderData.products);
    if(!orderData.products || orderData.products.length === 0) {
        throw new Error('La orden debe contener al menos un producto');
    }
    orderData.totalPrice = totalPrice;
    return await ordersRepository.createOrder(orderData);
}

const getOrderById = async (id) => {
    return await ordersRepository.getOrderById(id);
}

const updateOrder = async (id , orderData) => {
    const order = await ordersRepository.getOrderById(id);
    if(!order) {
        throw new Error('Orden no encontrada');
    }
    const totalPrice = calculateTotalPrice(orderData.products);
    orderData.totalPrice = totalPrice;
    return await ordersRepository.updateOrder(id , orderData);
}

const deleteOrder = async (id) => {
    const order = await ordersRepository.getOrderById(id);
    if(!order) {
        throw new Error('Orden no encontrada');
    }
    return await ordersRepository.deleteOrder(id);
}

module.exports = {getOrders , createOrder , getOrderById , updateOrder , deleteOrder}