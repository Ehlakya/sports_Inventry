const { Op } = require('sequelize');
const { InventoryTransaction, SalesSummary, Product, Order, User, OrderItem } = require('../models');

const getTransactionHistory = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10, orderedBy = 'ALL' } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);
    const where = {};

    if (orderedBy === 'Customer' || orderedBy === 'Supplier') {
      where.orderedBy = orderedBy;
    }

    const productInclude = {
      model: Product,
      as: 'product',
      attributes: ['productName', 'brand'],
      ...(search ? { where: { productName: { [Op.iLike]: `%${search}%` } } } : {})
    };

    const { rows: transactions, count } = await InventoryTransaction.findAndCountAll({
      where,
      include: [
        productInclude,
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: OrderItem,
              as: 'items'
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'username', 'phone', 'role']
        }
      ],
      order: [['createdAt', 'DESC']],
      offset: (pageNumber - 1) * pageSize,
      limit: pageSize,
      distinct: true
    });

    const data = transactions.map(transaction => {
      const orderItem = transaction.order?.items?.find(i => i.productId === transaction.productId && i.quantity === transaction.quantity);

      return {
        id: transaction.id,
        orderNumber: transaction.order?.orderNumber || null,
        productName: transaction.product?.productName || 'Unknown Product',
        quantity: transaction.quantity || Math.abs((transaction.quantityBefore || 0) - (transaction.quantityAfter || 0)),
        stockBefore: transaction.quantityBefore,
        stockAfter: transaction.quantityAfter,
        transactionDate: transaction.createdAt,
        transactionType: transaction.transactionType,
        orderedBy: transaction.orderedBy || (transaction.order?.orderType === 'SUPPLIER_ORDER' ? 'Supplier' : 'Customer'),
        notes: transaction.notes,
        
        // Detailed Order Info
        customerName: transaction.user?.name || '-',
        username: transaction.user?.username || '-',
        phoneNumber: transaction.user?.phone || '-',
        productSize: orderItem?.size && orderItem.size !== 'N/A' ? orderItem.size : '-',
        customerPrice: orderItem?.price || '-',
        gstAmount: transaction.order?.gstAmount || '-',
        totalAmount: transaction.order?.totalAmount || '-',
        orderDate: transaction.order?.createdAt || transaction.createdAt,
        expectedDeliveryDate: transaction.order?.estimatedDeliveryDate || null,
        orderStatus: transaction.order?.orderStatus || '-',
        userType: transaction.order?.orderType === 'SUPPLIER_ORDER' ? 'Supplier' : 'Customer'
      };
    });

    res.status(200).json({
      transactions: data,
      data: {
        rows: data,
        count
      }
    });
  } catch (error) {
    next(error);
  }
};

const getSalesSummary = async (req, res, next) => {
  try {
    let summary = await SalesSummary.findByPk(1);
    
    if (!summary) {
      // Create default if none exists
      summary = await SalesSummary.create({
        id: 1,
        totalRevenue: 0.00,
        totalSupplierSales: 0.00,
        totalCustomerSales: 0.00,
        totalOrders: 0
      });
    }

    res.status(200).json({
      salesSummary: {
        id: summary.id,
        totalRevenue: parseFloat(summary.totalRevenue),
        totalSupplierSales: parseFloat(summary.totalSupplierSales),
        totalCustomerSales: parseFloat(summary.totalCustomerSales),
        totalOrders: summary.totalOrders,
        updatedAt: summary.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactionHistory,
  getSalesSummary
};
