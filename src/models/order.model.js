const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Order = sequelize.define("order", {
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    products: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
});

module.exports = Order;