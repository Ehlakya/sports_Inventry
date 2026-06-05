const { User, Product, ProductSize, Order, SalesSummary, Category } = require('../models');

/**
 * Fetches dashboard details for the Admin role.
 */
const getAdminDashboard = async () => {
  // 1. Total Products
  const totalProducts = await Product.count();

  // 2. Total Suppliers
  const totalSuppliers = await User.count({ where: { role: 'SUPPLIER' } });

  // 3. Total Customers
  const totalCustomers = await User.count({ where: { role: 'CUSTOMER' } });

  // 4. Total Orders
  const totalOrders = await Order.count();

  // 5. Available Stock (real-time sum of stock across all ProductSizes)
  const availableStockResult = await ProductSize.sum('stock');
  const availableStock = availableStockResult || 0;

  // 6. Sales Summary
  let summary = await SalesSummary.findByPk(1);
  if (!summary) {
    // If no sales have occurred yet, return zeros
    summary = {
      totalRevenue: 0.00,
      totalSupplierSales: 0.00,
      totalCustomerSales: 0.00
    };
  }

  // 7. Low Stock Alerts (items with size stock below 10)
  const lowStockSizes = await ProductSize.findAll({
    where: {
      stock: {
        [require('sequelize').Op.lt]: 10 // stock < 10
      }
    },
    include: [{
      model: Product,
      as: 'product',
      attributes: ['productName', 'brand']
    }],
    order: [['stock', 'ASC']]
  });

  const lowStockAlerts = lowStockSizes.map(s => ({
    productId: s.productId,
    productName: s.product ? s.product.productName : 'Unknown',
    brand: s.product ? s.product.brand : 'Unknown',
    size: s.size,
    stock: s.stock
  }));

  return {
    totalProducts,
    totalSuppliers,
    totalCustomers,
    totalOrders,
    availableStock,
    salesSummary: {
      totalRevenue: parseFloat(summary.totalRevenue),
      supplierRevenue: parseFloat(summary.totalSupplierSales),
      customerRevenue: parseFloat(summary.totalCustomerSales)
    },
    lowStockAlerts
  };
};

/**
 * Fetches dashboard details for a Supplier.
 */
const getSupplierDashboard = async (supplierId) => {
  // 1. Total Bulk Orders placed by this supplier
  const totalBulkOrders = await Order.count({
    where: { userId: supplierId, orderType: 'SUPPLIER_ORDER' }
  });

  // 2. Counts of pending and completed orders
  const pendingOrders = await Order.count({
    where: { userId: supplierId, orderType: 'SUPPLIER_ORDER', orderStatus: 'PENDING' }
  });

  const completedOrders = await Order.count({
    where: { userId: supplierId, orderType: 'SUPPLIER_ORDER', orderStatus: 'DELIVERED' }
  });

  // 3. Complete Order History
  const orderHistory = await Order.findAll({
    where: { userId: supplierId, orderType: 'SUPPLIER_ORDER' },
    order: [['createdAt', 'DESC']],
    limit: 20
  });

  return {
    totalBulkOrders,
    pendingOrders,
    completedOrders,
    orderHistory
  };
};

/**
 * Fetches dashboard details for a Customer.
 */
const getCustomerDashboard = async (customerId) => {
  // 1. Total Orders placed by this customer
  const totalOrders = await Order.count({
    where: { userId: customerId }
  });

  // 2. Recent Orders (last 5)
  const recentOrders = await Order.findAll({
    where: { userId: customerId },
    order: [['createdAt', 'DESC']],
    limit: 5
  });

  return {
    totalOrders,
    recentOrders,
    cartSummary: {
      message: "Send POST /api/orders/cart-summary with array of items to get real-time price calculations."
    }
  };
};

module.exports = {
  getAdminDashboard,
  getSupplierDashboard,
  getCustomerDashboard
};
