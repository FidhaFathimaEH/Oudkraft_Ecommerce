const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

class AdminController {
  static getDashboard = asyncHandler(async (req, res) => {
    const [totalProducts, totalOrders, totalCustomers, pendingOrders, recentOrders] =
      await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        User.countDocuments({ role: 'customer' }),
        Order.countDocuments({ status: 'Pending' }),
        Order.find().sort({ createdAt: -1 }).limit(10).lean(),
      ]);

    return ApiResponse.send(res, 200, {
      stats: { totalProducts, totalOrders, totalCustomers, pendingOrders },
      recentOrders,
    }, 'Dashboard data retrieved');
  });

  static getCustomers = asyncHandler(async (req, res) => {
    const customers = await User.find({ role: 'customer' })
      .select('name email phone isActive createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return ApiResponse.send(res, 200, { customers, count: customers.length }, 'Customers retrieved');
  });
}

module.exports = AdminController;
