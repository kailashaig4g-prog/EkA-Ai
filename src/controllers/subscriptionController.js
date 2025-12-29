const paymentService = require('../services/paymentService');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * @desc    Get available subscription plans
 * @route   GET /api/v1/subscriptions/plans
 * @access  Public
 */
exports.getPlans = async (req, res) => {
  try {
    const plans = {
      free: {
        name: 'Free',
        price: { monthly: 0, yearly: 0 },
        features: Subscription.getPlanFeatures('free'),
        description: 'Perfect for trying out EkA-Ai',
      },
      premium: {
        name: 'Premium',
        price: {
          monthly: { usd: 9.99, inr: 749 },
          yearly: { usd: 99.99, inr: 7499 },
        },
        features: Subscription.getPlanFeatures('premium'),
        description: 'Best for regular users',
        savings: { yearly: 16 }, // 16% savings on yearly
      },
      professional: {
        name: 'Professional',
        price: {
          monthly: { usd: 29.99, inr: 2249 },
          yearly: { usd: 299.99, inr: 22499 },
        },
        features: Subscription.getPlanFeatures('professional'),
        description: 'For power users and businesses',
        savings: { yearly: 16 },
      },
    };

    res.status(200).json({
      success: true,
      data: { plans }
    });
  } catch (error) {
    logger.error(`Get plans error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get plans',
      error: error.message
    });
  }
};

/**
 * @desc    Get current user subscription
 * @route   GET /api/v1/subscriptions/current
 * @access  Private
 */
exports.getCurrentSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      user: req.user.id,
      status: { $in: ['active', 'trialing', 'past_due'] }
    });

    if (!subscription) {
      // Create free subscription if none exists
      const freeSubscription = new Subscription({
        user: req.user.id,
        plan: 'free',
        status: 'active',
        amount: 0,
        features: Subscription.getPlanFeatures('free'),
      });
      await freeSubscription.save();

      return res.status(200).json({
        success: true,
        data: { subscription: freeSubscription }
      });
    }

    res.status(200).json({
      success: true,
      data: { subscription }
    });
  } catch (error) {
    logger.error(`Get current subscription error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get current subscription',
      error: error.message
    });
  }
};

/**
 * @desc    Subscribe to a plan
 * @route   POST /api/v1/subscriptions/subscribe
 * @access  Private
 */
exports.subscribe = async (req, res) => {
  try {
    const { plan, billingCycle, paymentMethod, paymentMethodId, currency } = req.body;

    // Validate plan
    if (!['premium', 'professional'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected'
      });
    }

    // Validate billing cycle
    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid billing cycle'
      });
    }

    // Validate payment method
    if (!['stripe', 'razorpay'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    const user = await User.findById(req.user.id);
    const amount = paymentService.getPlanPricing(plan, billingCycle, currency || 'usd');

    let subscriptionData;

    if (paymentMethod === 'stripe') {
      // Create Stripe customer if doesn't exist
      let stripeCustomerId = user.stripeCustomerId;
      
      if (!stripeCustomerId) {
        const customer = await paymentService.createStripeCustomer(user, paymentMethodId);
        stripeCustomerId = customer.id;
        user.stripeCustomerId = stripeCustomerId;
        await user.save();
      }

      // Create Stripe subscription
      const stripeSubscription = await paymentService.createStripeSubscription(
        stripeCustomerId,
        req.body.stripePriceId,
        req.body.trialDays || 0
      );

      subscriptionData = {
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      };
    } else if (paymentMethod === 'razorpay') {
      // Create Razorpay customer if doesn't exist
      let razorpayCustomerId = user.razorpayCustomerId;
      
      if (!razorpayCustomerId) {
        const customer = await paymentService.createRazorpayCustomer(user);
        razorpayCustomerId = customer.id;
        user.razorpayCustomerId = razorpayCustomerId;
        await user.save();
      }

      // Create Razorpay subscription
      const razorpaySubscription = await paymentService.createRazorpaySubscription(
        req.body.razorpayPlanId,
        razorpayCustomerId,
        billingCycle === 'monthly' ? 12 : 1
      );

      subscriptionData = {
        razorpaySubscriptionId: razorpaySubscription.id,
        razorpayCustomerId,
        currentPeriodStart: new Date(razorpaySubscription.start_at * 1000),
        currentPeriodEnd: new Date(razorpaySubscription.end_at * 1000),
      };
    }

    // Cancel any existing subscription
    const existingSubscription = await Subscription.findOne({
      user: req.user.id,
      status: { $in: ['active', 'trialing'] }
    });

    if (existingSubscription && existingSubscription.plan !== 'free') {
      existingSubscription.status = 'cancelled';
      existingSubscription.cancelledAt = new Date();
      await existingSubscription.save();
    }

    // Create new subscription
    const subscription = new Subscription({
      user: req.user.id,
      plan,
      status: req.body.trialDays ? 'trialing' : 'active',
      billingCycle,
      amount,
      currency: currency || 'USD',
      paymentMethod,
      features: Subscription.getPlanFeatures(plan),
      ...subscriptionData,
    });

    if (req.body.trialDays) {
      subscription.trialStart = new Date();
      subscription.trialEnd = new Date(Date.now() + req.body.trialDays * 24 * 60 * 60 * 1000);
    }

    await subscription.save();

    // Generate invoice
    await paymentService.generateInvoice(subscription, user);

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: { subscription }
    });
  } catch (error) {
    logger.error(`Subscribe error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Subscription failed',
      error: error.message
    });
  }
};

/**
 * @desc    Upgrade/downgrade subscription
 * @route   PUT /api/v1/subscriptions/upgrade
 * @access  Private
 */
exports.upgradeSubscription = async (req, res) => {
  try {
    const { plan, billingCycle } = req.body;

    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: { $in: ['active', 'trialing'] }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Validate plan upgrade/downgrade
    const planHierarchy = { free: 0, premium: 1, professional: 2 };
    if (planHierarchy[plan] <= planHierarchy[subscription.plan]) {
      return res.status(400).json({
        success: false,
        message: 'Can only upgrade to a higher plan'
      });
    }

    subscription.plan = plan;
    subscription.billingCycle = billingCycle || subscription.billingCycle;
    subscription.amount = paymentService.getPlanPricing(
      plan,
      subscription.billingCycle,
      subscription.currency.toLowerCase()
    );
    subscription.features = Subscription.getPlanFeatures(plan);

    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription upgraded successfully',
      data: { subscription }
    });
  } catch (error) {
    logger.error(`Upgrade subscription error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Subscription upgrade failed',
      error: error.message
    });
  }
};

/**
 * @desc    Cancel subscription
 * @route   DELETE /api/v1/subscriptions/cancel
 * @access  Private
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const { immediate } = req.body;

    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: { $in: ['active', 'trialing'] }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    if (subscription.plan === 'free') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel free subscription'
      });
    }

    // Cancel with payment provider
    if (subscription.paymentMethod === 'stripe' && subscription.stripeSubscriptionId) {
      await paymentService.cancelStripeSubscription(
        subscription.stripeSubscriptionId,
        !immediate
      );
    } else if (subscription.paymentMethod === 'razorpay' && subscription.razorpaySubscriptionId) {
      await paymentService.cancelRazorpaySubscription(
        subscription.razorpaySubscriptionId,
        !immediate
      );
    }

    if (immediate) {
      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      
      // Downgrade to free
      const freeSubscription = new Subscription({
        user: req.user.id,
        plan: 'free',
        status: 'active',
        amount: 0,
        features: Subscription.getPlanFeatures('free'),
      });
      await freeSubscription.save();
    } else {
      subscription.cancelAtPeriodEnd = true;
    }

    await subscription.save();

    res.status(200).json({
      success: true,
      message: immediate 
        ? 'Subscription cancelled immediately' 
        : 'Subscription will be cancelled at period end',
      data: { subscription }
    });
  } catch (error) {
    logger.error(`Cancel subscription error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Subscription cancellation failed',
      error: error.message
    });
  }
};

/**
 * @desc    Handle Stripe webhook
 * @route   POST /api/v1/subscriptions/webhook/stripe
 * @access  Public
 */
exports.stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = paymentService.stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err) {
      logger.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    await paymentService.handleStripeWebhook(event);

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error(`Stripe webhook error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Webhook handling failed',
      error: error.message
    });
  }
};

/**
 * @desc    Handle Razorpay webhook
 * @route   POST /api/v1/subscriptions/webhook/razorpay
 * @access  Public
 */
exports.razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    await paymentService.handleRazorpayWebhook(req.body);

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error(`Razorpay webhook error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Webhook handling failed',
      error: error.message
    });
  }
};

/**
 * @desc    Get subscription usage
 * @route   GET /api/v1/subscriptions/usage
 * @access  Private
 */
exports.getUsage = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: { $in: ['active', 'trialing'] }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    const usage = {
      current: subscription.usage,
      limits: {
        chatMessages: subscription.features.chatMessagesPerMonth,
        visionAnalyses: subscription.features.visionAnalysesPerMonth,
        audioTranscriptions: subscription.features.audioTranscriptionsPerMonth,
        imageGenerations: subscription.features.imageGenerationsPerMonth,
      },
      percentage: {
        chatMessages: subscription.features.chatMessagesPerMonth > 0 
          ? Math.round((subscription.usage.chatMessages / subscription.features.chatMessagesPerMonth) * 100)
          : 0,
        visionAnalyses: subscription.features.visionAnalysesPerMonth > 0
          ? Math.round((subscription.usage.visionAnalyses / subscription.features.visionAnalysesPerMonth) * 100)
          : 0,
        audioTranscriptions: subscription.features.audioTranscriptionsPerMonth > 0
          ? Math.round((subscription.usage.audioTranscriptions / subscription.features.audioTranscriptionsPerMonth) * 100)
          : 0,
        imageGenerations: subscription.features.imageGenerationsPerMonth > 0
          ? Math.round((subscription.usage.imageGenerations / subscription.features.imageGenerationsPerMonth) * 100)
          : 0,
      },
      lastResetDate: subscription.usage.lastResetDate,
    };

    res.status(200).json({
      success: true,
      data: { usage }
    });
  } catch (error) {
    logger.error(`Get usage error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get usage',
      error: error.message
    });
  }
};
