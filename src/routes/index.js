const express = require('express');
const router = express.Router();
const authRoutes = require('./v1/authRoutes');
const chatRoutes = require('./v1/chatRoutes');
const vehicleRoutes = require('./v1/vehicleRoutes');
const serviceHistoryRoutes = require('./v1/serviceHistoryRoutes');
const audioRoutes = require('./v1/audioRoutes');
const visionRoutes = require('./v1/visionRoutes');
const imageRoutes = require('./v1/imageRoutes');
const subscriptionRoutes = require('./v1/subscriptionRoutes');
const adminRoutes = require('./v1/admin');

// Mount routes
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/service-history', serviceHistoryRoutes);
router.use('/audio', audioRoutes);
router.use('/vision', visionRoutes);
router.use('/images', imageRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/admin', adminRoutes);

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
      audio: '/api/v1/audio',
      vision: '/api/v1/vision',
      images: '/api/v1/images',
      subscriptions: '/api/v1/subscriptions',
      admin: '/api/v1/admin',
    },
  });
});

module.exports = router;
