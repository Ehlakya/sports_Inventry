const { InventoryTransaction, SalesSummary, Product } = require('../models');

const getTransactionHistory = async (req, res, next) => {
  try {
    const transactions = await InventoryTransaction.findAll({
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['productName', 'brand']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      transactions
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
