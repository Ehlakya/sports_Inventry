const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductSize = sequelize.define('ProductSize', {
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
  size: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'product_sizes',
  indexes: [
    {
      unique: true,
      fields: ['productId', 'size']
    }
  ]
});

module.exports = ProductSize;
