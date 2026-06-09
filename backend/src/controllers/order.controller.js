const orderService = require('../services/order.service');
const { Order, OrderItem, Product, Category, User } = require('../models');

const getOrderSourceDetails = (order) => {
  const isSupplierOrder = order.orderType === 'SUPPLIER_ORDER';
  const user = order.user || {};

  return {
    userType: isSupplierOrder ? 'Supplier' : 'Customer',
    orderSource: isSupplierOrder ? 'Supplier Order' : 'Customer Order',
    sourceDetails: isSupplierOrder
      ? {
          supplierName: user.name || null,
          supplierId: user.id || order.userId
        }
      : {
          customerName: user.name || null,
          username: user.username || null,
          phoneNumber: user.phone || null
        }
  };
};

const createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const result = await orderService.placeOrder(userId, userRole, items);

    res.status(210).json({
      success: true,
      message: 'Order placed successfully.',
      ...result
    });
  } catch (error) {
    // Check if it's a validation/business rule error (e.g. stock)
    if (error.message.includes('Insufficient stock') || error.message.includes('not found') || error.message.includes('not available')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const getOrderHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const queryOptions = {
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['productName', 'brand', 'imageUrl', 'categoryId'],
              include: [{ model: Category, as: 'category', attributes: ['categoryName'] }]
            }
          ]
        }
      ]
    };

    // If CUSTOMER or SUPPLIER, filter by their own userId
    if (userRole !== 'ADMIN') {
      queryOptions.where = { userId };
    } else {
      // Admin also gets the user details
      queryOptions.include.push({ model: User, as: 'user', attributes: ['id', 'name', 'username', 'email', 'phone', 'role'] });
    }

    const orderRows = await Order.findAll(queryOptions);
    const orders = orderRows.map(order => ({
      ...order.toJSON(),
      ...getOrderSourceDetails(order)
    }));

    res.status(200).json({
      orders
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['productName', 'brand', 'imageUrl', 'categoryId'],
              include: [{ model: Category, as: 'category', attributes: ['categoryName'] }]
            }
          ]
        },
        { model: User, as: 'user', attributes: ['id', 'name', 'username', 'email', 'phone', 'address', 'role'] }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // RBAC: CUSTOMER and SUPPLIER can only view their own orders
    if (userRole !== 'ADMIN' && order.userId !== userId) {
      return res.status(403).json({ error: 'Access denied. You cannot view other users\' orders.' });
    }

    res.status(200).json({
      order: {
        ...order.toJSON(),
        ...getOrderSourceDetails(order)
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ error: `Invalid order status. Allowed values: ${validStatuses.join(', ')}` });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({
      message: 'Order status updated successfully.',
      order
    });
  } catch (error) {
    next(error);
  }
};

const getCartSummary = async (req, res, next) => {
  try {
    const { items } = req.body;
    const userRole = req.user.role;

    const summary = await orderService.calculateCartSummary(items, userRole);

    res.status(200).json(summary);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderHistory,
  getOrderById,
  updateOrderStatus,
  getCartSummary
};
