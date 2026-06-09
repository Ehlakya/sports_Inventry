const { Op } = require('sequelize');
const { User, Product, ProductSize, Order, OrderItem, SalesSummary, Category } = require('../models');

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

  // 5. Available Stock — sum of all ProductSize stock + availableQuantity for no-size products
  const sizeStockResult = await ProductSize.sum('stock');
  const sizeStock = sizeStockResult || 0;

  // Also count equipment-type products (no sizes) by summing availableQuantity
  // for products that have no associated ProductSize rows
  const allProducts = await Product.findAll({
    attributes: ['id', 'availableQuantity'],
    include: [{ model: ProductSize, as: 'sizes', attributes: ['id'] }]
  });
  const equipmentStock = allProducts
    .filter(p => p.sizes.length === 0)
    .reduce((sum, p) => sum + (p.availableQuantity || 0), 0);
  const availableStock = sizeStock + equipmentStock;

  // 6. Sales Summary
  let summary = await SalesSummary.findByPk(1);
  if (!summary) {
    summary = { totalRevenue: 0, totalSupplierSales: 0, totalCustomerSales: 0 };
  }

  // 7. Low Stock Alerts (size stock < 10)
  const lowStockSizes = await ProductSize.findAll({
    where: { stock: { [Op.lt]: 10 } },
    include: [{ model: Product, as: 'product', attributes: ['productName', 'brand'] }],
    order: [['stock', 'ASC']],
    limit: 10
  });

  const lowStockAlerts = lowStockSizes.map(s => ({
    productId: s.productId,
    productName: s.product ? s.product.productName : 'Unknown',
    brand: s.product ? s.product.brand : 'Unknown',
    size: s.size,
    stock: s.stock
  }));

  // 8. Recent Orders (last 10, with user + first product name)
  const recentOrderRows = await Order.findAll({
    order: [['createdAt', 'DESC']],
    limit: 10,
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'username', 'email', 'phone', 'role'] },
      {
        model: OrderItem,
        as: 'items',
        limit: 1,
        include: [{ model: Product, as: 'product', attributes: ['productName'] }]
      }
    ]
  });

  const recentOrders = recentOrderRows.map(o => {
    const isSupplierOrder = o.orderType === 'SUPPLIER_ORDER';
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user ? o.user.name : 'Unknown',
      orderedByName: o.user ? o.user.name : 'Unknown',
      productName: o.items && o.items[0] ? o.items[0].product?.productName : 'N/A',
      quantity: o.items && o.items[0] ? o.items[0].quantity : null,
      totalAmount: parseFloat(o.totalAmount),
      orderStatus: o.orderStatus,
      orderType: o.orderType,
      userType: isSupplierOrder ? 'Supplier' : 'Customer',
      orderSource: isSupplierOrder ? 'Supplier Order' : 'Customer Order',
      sourceDetails: isSupplierOrder
        ? {
            supplierName: o.user?.name || null,
            supplierId: o.user?.id || o.userId
          }
        : {
            customerName: o.user?.name || null,
            username: o.user?.username || null,
            phoneNumber: o.user?.phone || null
          },
      createdAt: o.createdAt
    };
  });

  return {
    totalProducts,
    totalSuppliers,
    totalCustomers,
    totalOrders,
    availableStock,
    totalRevenue: parseFloat(summary.totalRevenue),
    salesSummary: {
      totalRevenue: parseFloat(summary.totalRevenue),
      supplierRevenue: parseFloat(summary.totalSupplierSales),
      customerRevenue: parseFloat(summary.totalCustomerSales)
    },
    lowStockAlerts,
    recentOrders
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

  // 3. Total Purchase Amount
  const totalPurchaseAmountResult = await Order.sum('totalAmount', {
    where: { userId: supplierId, orderType: 'SUPPLIER_ORDER' }
  });
  const totalPurchaseAmount = parseFloat(totalPurchaseAmountResult || 0);

  // 4. Recent Order History (last 5) with items and product names
  const orderHistory = await Order.findAll({
    where: { userId: supplierId, orderType: 'SUPPLIER_ORDER' },
    order: [['createdAt', 'DESC']],
    limit: 5,
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['productName', 'brand', 'imageUrl'] }]
      }
    ]
  });

  return {
    totalBulkOrders,
    pendingOrders,
    completedOrders,
    totalPurchaseAmount,
    orderHistory
  };
};

/**
 * Fetches dashboard details for a Customer.
 */
const getCustomerDashboard = async (customerId) => {
  // 1. Total Orders placed by this customer (CUSTOMER_ORDER only)
  const totalOrders = await Order.count({
    where: { userId: customerId, orderType: 'CUSTOMER_ORDER' }
  });

  // 2. Total Amount Spent
  const totalAmountSpentResult = await Order.sum('totalAmount', {
    where: { userId: customerId, orderType: 'CUSTOMER_ORDER' }
  });
  const totalAmountSpent = parseFloat(totalAmountSpentResult || 0);

  // 3. Pending/Active orders count
  const pendingOrders = await Order.count({
    where: {
      userId: customerId,
      orderType: 'CUSTOMER_ORDER',
      orderStatus: { [Op.in]: ['PENDING', 'PROCESSING', 'SHIPPED'] }
    }
  });

  // 4. Delivered orders count
  const deliveredOrders = await Order.count({
    where: { userId: customerId, orderType: 'CUSTOMER_ORDER', orderStatus: 'DELIVERED' }
  });

  // 5. Recent Orders (last 5) with product details
  const recentOrderRows = await Order.findAll({
    where: { userId: customerId, orderType: 'CUSTOMER_ORDER' },
    order: [['createdAt', 'DESC']],
    limit: 5,
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['productName', 'brand', 'imageUrl'] }]
      }
    ]
  });

  return {
    totalOrders,
    totalAmountSpent,
    pendingOrders,
    deliveredOrders,
    recentOrders: recentOrderRows
  };
};

module.exports = {
  getAdminDashboard,
  getSupplierDashboard,
  getCustomerDashboard
};
