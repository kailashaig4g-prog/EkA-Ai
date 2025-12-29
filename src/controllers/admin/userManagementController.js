const User = require('../../models/User');
const Vehicle = require('../../models/Vehicle');
const Subscription = require('../../models/Subscription');
const logger = require('../../utils/logger');

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.isActive = status === 'active';
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    logger.error(`Get all users error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const vehicles = await Vehicle.find({ owner: user._id });
    const subscription = await Subscription.findOne({ user: user._id, status: 'active' });

    res.status(200).json({
      success: true,
      data: { user, vehicles, subscription }
    });
  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    logger.error(`Update user error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Delete user error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    const usersToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    res.status(200).json({
      success: true,
      data: { totalUsers, activeUsers, adminUsers, usersToday }
    });
  } catch (error) {
    logger.error(`Get user stats error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
