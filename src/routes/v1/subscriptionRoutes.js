const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const subscriptionController = require('../../controllers/subscriptionController');

// Public routes
router.get('/plans', subscriptionController.getPlans);

// Webhook routes (no auth required)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), subscriptionController.stripeWebhook);
router.post('/webhook/razorpay', subscriptionController.razorpayWebhook);

// Protected routes
router.get('/current', protect, subscriptionController.getCurrentSubscription);
router.get('/usage', protect, subscriptionController.getUsage);
router.post('/subscribe', protect, subscriptionController.subscribe);
router.put('/upgrade', protect, subscriptionController.upgradeSubscription);
router.delete('/cancel', protect, subscriptionController.cancelSubscription);

module.exports = router;
