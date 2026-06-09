const sequelize = require('../config/db');
const User = require('./user.model');
const Category = require('./category.model');
const Product = require('./product.model');
const ProductSize = require('./productSize.model');
const Order = require('./order.model');
const OrderItem = require('./orderItem.model');
const SalesSummary = require('./salesSummary.model');
const InventoryTransaction = require('./inventoryTransaction.model');
const Invoice = require('./invoice.model');

// Define Relationships

// Category <-> Product
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products', onDelete: 'RESTRICT' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Product <-> ProductSize
Product.hasMany(ProductSize, { foreignKey: 'productId', as: 'sizes', onDelete: 'CASCADE' });
ProductSize.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Product <-> InventoryTransaction
Product.hasMany(InventoryTransaction, { foreignKey: 'productId', as: 'transactions', onDelete: 'CASCADE' });
InventoryTransaction.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Order/User <-> InventoryTransaction
Order.hasMany(InventoryTransaction, { foreignKey: 'orderId', as: 'inventoryTransactions', onDelete: 'SET NULL' });
InventoryTransaction.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
User.hasMany(InventoryTransaction, { foreignKey: 'userId', as: 'inventoryTransactions', onDelete: 'SET NULL' });
InventoryTransaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Order
User.hasMany(Order, { foreignKey: 'userId', as: 'orders', onDelete: 'RESTRICT' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Order <-> Invoice
Order.hasOne(Invoice, { foreignKey: 'orderId', as: 'invoice', onDelete: 'CASCADE' });
Invoice.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Product <-> OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems', onDelete: 'RESTRICT' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductSize,
  Order,
  OrderItem,
  SalesSummary,
  InventoryTransaction,
  Invoice
};
