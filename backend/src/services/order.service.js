const { sequelize, User, Product, ProductSize, Order, OrderItem, SalesSummary, InventoryTransaction, Invoice } = require('../models');

// Helper to format date as "D MMMM YYYY" (e.g. "10 June 2026")
const formatDate = (date) => {
  const day = date.getDate();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${monthName} ${year}`;
};

/**
 * Places an order for a User.
 * Runs atomically inside a Sequelize transaction.
 */
const placeOrder = async (userId, userRole, items) => {
  const t = await sequelize.transaction();

  try {
    // Determine order type based on user role
    let orderType = 'CUSTOMER_ORDER';
    let gstRate = 0.18; // Default to Customer GST

    if (userRole === 'SUPPLIER') {
      orderType = 'SUPPLIER_ORDER';
      gstRate = 0.12; // Supplier GST
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    let subtotal = 0;
    const itemsToCreate = [];
    const inventoryTransactions = [];

    // Fetch user details for inventory logs
    const user = await User.findByPk(userId, { transaction: t });
    const userName = user ? user.name : (orderType === 'CUSTOMER_ORDER' ? 'Customer' : 'Supplier');

    // Loop through items to validate and adjust inventory
    for (const item of items) {
      const { productId, size, quantity } = item;

      // Lock product to prevent race conditions
      const product = await Product.findByPk(productId, { transaction: t, lock: true });
      if (!product) {
        throw new Error(`Product with ID ${productId} not found.`);
      }

      let quantityBefore;
      let quantityAfter;

      if (size && size !== 'N/A') {
        // Lock product size stock
        const productSize = await ProductSize.findOne({
          where: { productId, size },
          transaction: t,
          lock: true
        });

        if (!productSize) {
          throw new Error(`Size "${size}" is not available for product "${product.productName}".`);
        }

        if (productSize.stock < quantity) {
          throw new Error(`Insufficient stock for product "${product.productName}" (Size: ${size}). Available: ${productSize.stock}, Requested: ${quantity}`);
        }

        // Capture stocks before adjustment
        quantityBefore = productSize.stock;
        quantityAfter = quantityBefore - quantity;

        // Deduct stock
        productSize.stock = quantityAfter;
        await productSize.save({ transaction: t });

        // Recalculate and update Product.availableQuantity
        const allSizes = await ProductSize.findAll({
          where: { productId },
          transaction: t
        });
        const newAvailableQuantity = allSizes.reduce((sum, s) => sum + s.stock, 0);
        product.availableQuantity = newAvailableQuantity;
        await product.save({ transaction: t });
      } else {
        // Product has no size (e.g. Equipment)
        if (product.availableQuantity < quantity) {
          throw new Error(`Insufficient stock for product "${product.productName}". Available: ${product.availableQuantity}, Requested: ${quantity}`);
        }
        
        quantityBefore = product.availableQuantity;
        quantityAfter = quantityBefore - quantity;
        
        product.availableQuantity = quantityAfter;
        await product.save({ transaction: t });
      }

      const transactionType = orderType === 'CUSTOMER_ORDER' ? 'CUSTOMER_ORDER_OUTFLOW' : 'SUPPLIER_ORDER_OUTFLOW';
      const orderedBy = orderType === 'CUSTOMER_ORDER' ? 'Customer' : 'Supplier';
      const orderAction = orderType === 'CUSTOMER_ORDER' ? 'purchased' : 'ordered';
      const sizeText = (size && size !== 'N/A') ? ` (Size ${size})` : '';

      inventoryTransactions.push({
        productId,
        userId,
        quantity,
        quantityBefore,
        quantityAfter,
        transactionType,
        orderedBy,
        notes: `${orderedBy} ${userName} ${orderAction} ${quantity} ${product.productName}${sizeText}.`
      });

      // Select price based on role
      const price = orderType === 'CUSTOMER_ORDER' ? product.customerPrice : product.supplierPrice;
      const priceVal = parseFloat(price);

      subtotal += priceVal * quantity;

      itemsToCreate.push({
        productId,
        size,
        quantity,
        price: priceVal
      });
    }

    // Calculations
    const gstAmount = subtotal * gstRate;
    const totalAmount = subtotal + gstAmount;

    // Delivery Logic: Expected Delivery Date = Order Date + 7 Days
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7);

    // Create Order
    const order = await Order.create({
      orderNumber,
      userId,
      orderType,
      subtotal,
      gstAmount,
      totalAmount,
      estimatedDeliveryDate,
      orderStatus: 'PENDING'
    }, { transaction: t });

    // Create Order Items
    const itemsWithOrderId = itemsToCreate.map(item => ({ ...item, orderId: order.id }));
    await OrderItem.bulkCreate(itemsWithOrderId, { transaction: t });

    // Create Inventory Transaction Records with Order linkage
    const transactionsWithOrderId = inventoryTransactions.map(entry => ({ ...entry, orderId: order.id }));
    await InventoryTransaction.bulkCreate(transactionsWithOrderId, { transaction: t });

    // Create Invoice
    const invoiceNumber = `INV-${orderNumber}`;
    await Invoice.create({
      invoiceNumber,
      orderId: order.id
    }, { transaction: t });

    // Update SalesSummary (Atomic update / Row lock)
    let salesSummary = await SalesSummary.findByPk(1, { transaction: t, lock: true });
    if (!salesSummary) {
      salesSummary = await SalesSummary.create({
        id: 1,
        totalRevenue: 0.00,
        totalSupplierSales: 0.00,
        totalCustomerSales: 0.00,
        totalOrders: 0
      }, { transaction: t });
    }

    salesSummary.totalRevenue = parseFloat(salesSummary.totalRevenue) + totalAmount;
    salesSummary.totalOrders += 1;
    if (orderType === 'CUSTOMER_ORDER') {
      salesSummary.totalCustomerSales = parseFloat(salesSummary.totalCustomerSales) + totalAmount;
    } else {
      salesSummary.totalSupplierSales = parseFloat(salesSummary.totalSupplierSales) + totalAmount;
    }
    await salesSummary.save({ transaction: t });

    // Commit Transaction
    await t.commit();

    // Fetch and return complete created order including items
    const completedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['productName', 'brand'] }]
        }
      ]
    });

    return {
      order: completedOrder,
      expectedDeliveryDate: formatDate(estimatedDeliveryDate),
      deliveryWithin: '1 Week'
    };

  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Calculates a stateless cart summary given an items array and the user role.
 */
const calculateCartSummary = async (items, userRole) => {
  let subtotal = 0;
  const itemSummaries = [];
  let gstRate = userRole === 'SUPPLIER' ? 0.12 : 0.18;

  for (const item of items) {
    const { productId, size, quantity } = item;

    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    let availableStock = 0;
    if (size && size !== 'N/A') {
      const productSize = await ProductSize.findOne({
        where: { productId, size }
      });
      availableStock = productSize ? productSize.stock : 0;
    } else {
      availableStock = product.availableQuantity || 0;
    }
    const isAvailable = availableStock >= quantity;

    const price = userRole === 'SUPPLIER' ? product.supplierPrice : product.customerPrice;
    const priceVal = parseFloat(price);
    const itemTotal = priceVal * quantity;
    subtotal += itemTotal;

    itemSummaries.push({
      productId,
      productName: product.productName,
      brand: product.brand,
      size,
      quantity,
      price: priceVal,
      total: itemTotal,
      availableStock,
      inStock: isAvailable
    });
  }

  const gstAmount = subtotal * gstRate;
  const totalAmount = subtotal + gstAmount;

  return {
    items: itemSummaries,
    subtotal,
    gstRate: `${gstRate * 100}%`,
    gstAmount,
    totalAmount,
    estimatedDeliveryDate: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    deliveryWithin: '1 Week'
  };
};

module.exports = {
  placeOrder,
  calculateCartSummary,
  formatDate
};
