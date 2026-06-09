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
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
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
  },
  orderedBy: {
    type: DataTypes.ENUM('Customer', 'Supplier'),
    allowNull: true
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'inventory_transactions'
});

module.exports = InventoryTransaction;
