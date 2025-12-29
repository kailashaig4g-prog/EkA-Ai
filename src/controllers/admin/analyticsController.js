const User = require('../../models/User');
const Subscription = require('../../models/Subscription');
const Invoice = require('../../models/Invoice');
const logger = require('../../utils/logger');

exports.getDashboardMetrics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      newUsersToday,
      activeSubscriptions,
      totalRevenue,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today } }),
      Subscription.countDocuments({ status: 'active' }),
      Invoice.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        newUsersToday,
        activeSubscriptions,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    logger.error(`Dashboard metrics error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
