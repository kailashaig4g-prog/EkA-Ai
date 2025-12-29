const express = require('express');
const router = express.Router();
const authRoutes = require('./v1/authRoutes');
const chatRoutes = require('./v1/chatRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);

// Root route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EkA-Ai API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      chat: '/api/v1/chat',
    },
  });
});

module.exports = router;
