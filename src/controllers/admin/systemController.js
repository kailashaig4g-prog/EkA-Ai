const os = require('os');
const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const cacheService = require('../../services/cacheService');
const openaiService = require('../../services/openaiService');

exports.getSystemHealth = async (req, res) => {
  try {
    const cpuUsage = os.loadavg()[0] / os.cpus().length * 100;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const redisStatus = cacheService.isEnabled() ? 'connected' : 'disabled';

    res.status(200).json({
      success: true,
      data: {
        cpu: { usage: cpuUsage.toFixed(2), cores: os.cpus().length },
        memory: { usage: memoryUsage.toFixed(2), total: totalMem, free: freeMem },
        database: { status: dbStatus },
        redis: { status: redisStatus },
        uptime: os.uptime(),
        nodeVersion: process.version
      }
    });
  } catch (error) {
    logger.error(`System health error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getApiStats = async (req, res) => {
  try {
    const costs = openaiService.getCosts();

    res.status(200).json({
      success: true,
      data: { openaiCosts: costs }
    });
  } catch (error) {
    logger.error(`API stats error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
