const express = require('express');
const router = express.Router();
const { adminAuth } = require('../../../middleware/adminAuth');
const userManagementController = require('../../../controllers/admin/userManagementController');
const systemController = require('../../../controllers/admin/systemController');
const analyticsController = require('../../../controllers/admin/analyticsController');

router.use(adminAuth);

router.get('/users', userManagementController.getAllUsers);
router.get('/users/stats', userManagementController.getUserStats);
router.get('/users/:id', userManagementController.getUserById);
router.put('/users/:id', userManagementController.updateUser);
router.delete('/users/:id', userManagementController.deleteUser);

router.get('/system/health', systemController.getSystemHealth);
router.get('/system/api-stats', systemController.getApiStats);

router.get('/analytics/dashboard', analyticsController.getDashboardMetrics);

module.exports = router;
