const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InventoryTransaction = sequelize.define('InventoryTransaction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantityBefore: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantityAfter: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  transactionType: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'inventory_transactions'
});

module.exports = InventoryTransaction;
