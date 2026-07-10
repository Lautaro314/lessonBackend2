const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');

const Order = sequelize.define('order' , {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
});

module.exports = Order;