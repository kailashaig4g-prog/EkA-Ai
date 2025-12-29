const express = require('express');
const router = express.Router();
const authRoutes = require('./v1/authRoutes');
const chatRoutes = require('./v1/chatRoutes');
const vehicleRoutes = require('./v1/vehicleRoutes');
const serviceHistoryRoutes = require('./v1/serviceHistoryRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/service-history', serviceHistoryRoutes);

// Root route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EkA-Ai API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      chat: '/api/v1/chat',
      vehicles: '/api/v1/vehicles',
      serviceHistory: '/api/v1/service-history',
    },
  });
});

module.exports = router;
