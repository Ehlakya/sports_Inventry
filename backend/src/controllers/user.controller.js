const { User, Order, OrderItem, Product, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// GET /users/suppliers - List all suppliers (ADMIN only)
const getSuppliers = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = { role: 'SUPPLIER' };
    if (search.trim()) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password', 'refreshToken'] },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: 'Suppliers fetched successfully.',
      data: { count, rows },
    });
  } catch (error) {
    next(error);
  }
};

// POST /users/suppliers - Create a new supplier (ADMIN only)
const createSupplier = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    const supplier = await User.create({
      name,
      email,
      password,
      role: 'SUPPLIER',
      phone: phone || null,
      address: address || null,
      createdByAdmin: true
    });

    res.status(201).json({
      message: 'Supplier created successfully.',
      data: supplier.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// PUT /users/suppliers/:id - Update a supplier (ADMIN only)
const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, password } = req.body;

    const supplier = await User.findOne({ where: { id, role: 'SUPPLIER' } });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found.' });
    }

    // Check email uniqueness if changing
    if (email && email !== supplier.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: 'A user with this email already exists.' });
      }
    }

    if (name !== undefined) supplier.name = name;
    if (email !== undefined) supplier.email = email;
    if (phone !== undefined) supplier.phone = phone;
    if (address !== undefined) supplier.address = address;
    if (password && password.trim()) supplier.password = password; // triggers beforeUpdate hook

    await supplier.save();

    res.status(200).json({
      message: 'Supplier updated successfully.',
      data: supplier.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /users/suppliers/:id - Delete a supplier (ADMIN only)
const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;

    const supplier = await User.findOne({ where: { id, role: 'SUPPLIER' } });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found.' });
    }

    await supplier.destroy();

    res.status(200).json({ message: 'Supplier deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// GET /users/customers - List all customers (ADMIN only)
const getCustomers = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10, status, date } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = { role: 'CUSTOMER' };
    
    if (search.trim()) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereClause.isActive = status === 'active';
    }
    
    if (date) {
      // Very basic date filtering matching YYYY-MM-DD
      whereClause.createdAt = {
        [Op.gte]: new Date(`${date}T00:00:00.000Z`),
        [Op.lt]: new Date(`${date}T23:59:59.999Z`)
      };
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: {
        exclude: ['password', 'refreshToken'],
        include: [
          [sequelize.literal(`(SELECT COUNT(*) FROM "orders" WHERE "orders"."userId" = "User"."id")`), 'ordersCount']
        ]
      },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Customers fetched successfully.',
      data: { count, rows }
    });
  } catch (error) {
    next(error);
  }
};

// GET /users/customers/:id - Get detailed profile (ADMIN only)
const getCustomerDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await User.findOne({
      where: { id, role: 'CUSTOMER' },
      attributes: { exclude: ['password', 'refreshToken'] }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    // Get aggregate order data
    const totalOrders = await Order.count({ where: { userId: id } });
    const totalAmountSpentResult = await Order.sum('totalAmount', { where: { userId: id } });
    const totalAmountSpent = parseFloat(totalAmountSpentResult || 0);

    // Get recent orders
    const recentOrders = await Order.findAll({
      where: { userId: id },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['productName', 'imageUrl'] }]
        }
      ]
    });

    res.status(200).json({
      message: 'Customer details fetched successfully.',
      data: {
        ...customer.get(),
        totalOrders,
        totalAmountSpent,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSuppliers, createSupplier, updateSupplier, deleteSupplier, getCustomers, getCustomerDetails };
