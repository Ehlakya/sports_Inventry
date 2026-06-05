const dashboardService = require('../services/dashboard.service');

const getDashboard = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    let data = null;

    switch (role) {
      case 'ADMIN':
        data = await dashboardService.getAdminDashboard();
        break;
      case 'SUPPLIER':
        data = await dashboardService.getSupplierDashboard(userId);
        break;
      case 'CUSTOMER':
        data = await dashboardService.getCustomerDashboard(userId);
        break;
      default:
        return res.status(403).json({ error: 'Unauthorized role.' });
    }

    res.status(200).json({
      role,
      dashboard: data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard
};
