const Stripe = require('stripe');
const Razorpay = require('razorpay');
const config = require('../config');
const logger = require('../utils/logger');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');

class PaymentService {
  constructor() {
    // Initialize Stripe
    if (config.stripe && config.stripe.secretKey) {
      this.stripe = new Stripe(config.stripe.secretKey);
      logger.info('Stripe initialized');
    } else {
      logger.warn('Stripe not configured');
      this.stripe = null;
    }

    // Initialize Razorpay
    if (config.razorpay && config.razorpay.keyId && config.razorpay.keySecret) {
      this.razorpay = new Razorpay({
        key_id: config.razorpay.keyId,
        key_secret: config.razorpay.keySecret,
      });
      logger.info('Razorpay initialized');
    } else {
      logger.warn('Razorpay not configured');
      this.razorpay = null;
    }

    // Plan pricing
    this.plans = {
      premium: {
        monthly: { usd: 9.99, inr: 749 },
        yearly: { usd: 99.99, inr: 7499 },
      },
      professional: {
        monthly: { usd: 29.99, inr: 2249 },
        yearly: { usd: 299.99, inr: 22499 },
      },
    };
  }

  /**
   * Create Stripe customer
   */
  async createStripeCustomer(user, paymentMethod = null) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
        },
        payment_method: paymentMethod,
        invoice_settings: paymentMethod ? {
          default_payment_method: paymentMethod,
        } : undefined,
      });

      return customer;
    } catch (error) {
      logger.error(`Stripe customer creation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Stripe subscription
   */
  async createStripeSubscription(customerId, priceId, trialDays = 0) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const subscriptionData = {
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      };

      if (trialDays > 0) {
        subscriptionData.trial_period_days = trialDays;
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionData);

      return subscription;
    } catch (error) {
      logger.error(`Stripe subscription creation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel Stripe subscription
   */
  async cancelStripeSubscription(subscriptionId, atPeriodEnd = true) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      if (atPeriodEnd) {
        return await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        return await this.stripe.subscriptions.cancel(subscriptionId);
      }
    } catch (error) {
      logger.error(`Stripe subscription cancellation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Razorpay customer
   */
  async createRazorpayCustomer(user) {
    if (!this.razorpay) {
      throw new Error('Razorpay not configured');
    }

    try {
      const customer = await this.razorpay.customers.create({
        name: user.name,
        email: user.email,
        contact: user.phone || '',
        notes: {
          userId: user._id.toString(),
        },
      });

      return customer;
    } catch (error) {
      logger.error(`Razorpay customer creation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Razorpay subscription
   */
  async createRazorpaySubscription(planId, customerId, totalCount) {
    if (!this.razorpay) {
      throw new Error('Razorpay not configured');
    }

    try {
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: planId,
        customer_id: customerId,
        total_count: totalCount,
        quantity: 1,
        notify_info: {
          notify_email: 1,
        },
      });

      return subscription;
    } catch (error) {
      logger.error(`Razorpay subscription creation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel Razorpay subscription
   */
  async cancelRazorpaySubscription(subscriptionId, atPeriodEnd = true) {
    if (!this.razorpay) {
      throw new Error('Razorpay not configured');
    }

    try {
      return await this.razorpay.subscriptions.cancel(subscriptionId, atPeriodEnd);
    } catch (error) {
      logger.error(`Razorpay subscription cancellation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create payment intent (Stripe)
   */
  async createPaymentIntent(amount, currency = 'usd', customerId = null) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      logger.error(`Payment intent creation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Razorpay order
   */
  async createRazorpayOrder(amount, currency = 'INR', receipt = null) {
    if (!this.razorpay) {
      throw new Error('Razorpay not configured');
    }

    try {
      const order = await this.razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency.toUpperCase(),
        receipt: receipt || `order_${Date.now()}`,
      });

      return order;
    } catch (error) {
      logger.error(`Razorpay order creation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  verifyRazorpaySignature(orderId, paymentId, signature) {
    if (!this.razorpay) {
      throw new Error('Razorpay not configured');
    }

    try {
      const crypto = require('crypto');
      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', config.razorpay.keySecret)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      logger.error(`Signature verification error: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate invoice
   */
  async generateInvoice(subscription, user, paymentDetails = {}) {
    try {
      const planPricing = this.plans[subscription.plan];
      const currency = subscription.currency.toLowerCase();
      const billingCycle = subscription.billingCycle;
      
      const amount = planPricing[billingCycle][currency];
      const taxAmount = subscription.calculateGST ? subscription.calculateGST() : 0;
      const totalAmount = amount + taxAmount;

      const invoice = new Invoice({
        user: user._id,
        subscription: subscription._id,
        amount,
        currency: subscription.currency,
        taxAmount,
        totalAmount,
        items: [
          {
            description: `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan - ${billingCycle}`,
            quantity: 1,
            unitPrice: amount,
            amount,
          }
        ],
        billingDetails: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
        },
        paymentMethod: subscription.paymentMethod,
        paymentDetails,
        period: {
          start: subscription.currentPeriodStart,
          end: subscription.currentPeriodEnd,
        },
      });

      await invoice.save();
      return invoice;
    } catch (error) {
      logger.error(`Invoice generation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process webhook from Stripe
   */
  async handleStripeWebhook(event) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object, 'stripe');
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object, 'stripe');
          break;

        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object, 'stripe');
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object, 'stripe');
          break;

        default:
          logger.info(`Unhandled Stripe event type: ${event.type}`);
      }
    } catch (error) {
      logger.error(`Stripe webhook handling error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process webhook from Razorpay
   */
  async handleRazorpayWebhook(event) {
    try {
      switch (event.event) {
        case 'subscription.activated':
        case 'subscription.updated':
          await this.handleSubscriptionUpdate(event.payload.subscription.entity, 'razorpay');
          break;

        case 'subscription.cancelled':
          await this.handleSubscriptionDeleted(event.payload.subscription.entity, 'razorpay');
          break;

        case 'payment.captured':
          await this.handlePaymentCaptured(event.payload.payment.entity, 'razorpay');
          break;

        default:
          logger.info(`Unhandled Razorpay event type: ${event.event}`);
      }
    } catch (error) {
      logger.error(`Razorpay webhook handling error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle subscription update
   */
  async handleSubscriptionUpdate(subscriptionData, provider) {
    try {
      const subscriptionId = provider === 'stripe' 
        ? subscriptionData.id 
        : subscriptionData.id;

      const query = provider === 'stripe'
        ? { stripeSubscriptionId: subscriptionId }
        : { razorpaySubscriptionId: subscriptionId };

      const subscription = await Subscription.findOne(query);

      if (subscription) {
        subscription.status = this.mapSubscriptionStatus(subscriptionData.status, provider);
        subscription.currentPeriodStart = new Date(subscriptionData.current_period_start * 1000);
        subscription.currentPeriodEnd = new Date(subscriptionData.current_period_end * 1000);
        await subscription.save();
      }
    } catch (error) {
      logger.error(`Subscription update handling error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle subscription deleted
   */
  async handleSubscriptionDeleted(subscriptionData, provider) {
    try {
      const subscriptionId = subscriptionData.id;
      const query = provider === 'stripe'
        ? { stripeSubscriptionId: subscriptionId }
        : { razorpaySubscriptionId: subscriptionId };

      const subscription = await Subscription.findOne(query);

      if (subscription) {
        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        await subscription.save();
      }
    } catch (error) {
      logger.error(`Subscription deletion handling error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle invoice paid (Stripe)
   */
  async handleInvoicePaid(invoiceData, provider) {
    try {
      const invoice = await Invoice.findOne({ 
        [provider === 'stripe' ? 'stripeInvoiceId' : 'razorpayInvoiceId']: invoiceData.id 
      });

      if (invoice) {
        await invoice.markAsPaid({
          transactionId: invoiceData.payment_intent,
          receiptUrl: invoiceData.hosted_invoice_url,
        });
      }
    } catch (error) {
      logger.error(`Invoice paid handling error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle payment failed
   */
  async handlePaymentFailed(invoiceData, provider) {
    try {
      const invoice = await Invoice.findOne({
        [provider === 'stripe' ? 'stripeInvoiceId' : 'razorpayInvoiceId']: invoiceData.id
      });

      if (invoice) {
        await invoice.markAsFailed();
      }

      // Update subscription status
      if (invoiceData.subscription) {
        const subscription = await Subscription.findOne({
          [provider === 'stripe' ? 'stripeSubscriptionId' : 'razorpaySubscriptionId']: invoiceData.subscription
        });

        if (subscription) {
          subscription.status = 'past_due';
          await subscription.save();
        }
      }
    } catch (error) {
      logger.error(`Payment failed handling error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle payment captured (Razorpay)
   */
  async handlePaymentCaptured(paymentData, _provider) {
    try {
      // Find associated order and update invoice
      const invoice = await Invoice.findOne({
        'paymentDetails.transactionId': paymentData.order_id
      });

      if (invoice) {
        await invoice.markAsPaid({
          transactionId: paymentData.id,
          chargeId: paymentData.id,
        });
      }
    } catch (error) {
      logger.error(`Payment captured handling error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Map subscription status
   */
  mapSubscriptionStatus(status, provider) {
    const statusMap = {
      stripe: {
        active: 'active',
        past_due: 'past_due',
        canceled: 'cancelled',
        unpaid: 'inactive',
        trialing: 'trialing',
      },
      razorpay: {
        created: 'inactive',
        authenticated: 'inactive',
        active: 'active',
        paused: 'inactive',
        halted: 'past_due',
        cancelled: 'cancelled',
        completed: 'inactive',
        expired: 'inactive',
      }
    };

    return statusMap[provider][status] || 'inactive';
  }

  /**
   * Get plan pricing
   */
  getPlanPricing(plan, billingCycle, currency) {
    if (!this.plans[plan] || !this.plans[plan][billingCycle]) {
      throw new Error('Invalid plan or billing cycle');
    }

    return this.plans[plan][billingCycle][currency.toLowerCase()];
  }
}

module.exports = new PaymentService();
