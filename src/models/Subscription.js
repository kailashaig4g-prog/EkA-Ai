const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'premium', 'professional'],
      default: 'free',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due', 'trialing'],
      default: 'active',
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'razorpay'],
      required: function() {
        return this.plan !== 'free';
      },
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    stripeSubscriptionId: {
      type: String,
      sparse: true,
    },
    razorpayCustomerId: {
      type: String,
      sparse: true,
    },
    razorpaySubscriptionId: {
      type: String,
      sparse: true,
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      required: function() {
        return this.plan !== 'free';
      },
    },
    trialStart: {
      type: Date,
    },
    trialEnd: {
      type: Date,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
    },
    features: {
      chatMessagesPerMonth: {
        type: Number,
        default: 50, // Free tier
      },
      visionAnalysesPerMonth: {
        type: Number,
        default: 5,
      },
      audioTranscriptionsPerMonth: {
        type: Number,
        default: 10,
      },
      imageGenerationsPerMonth: {
        type: Number,
        default: 0,
      },
      vehiclesAllowed: {
        type: Number,
        default: 1,
      },
      prioritySupport: {
        type: Boolean,
        default: false,
      },
      advancedAnalytics: {
        type: Boolean,
        default: false,
      },
    },
    usage: {
      chatMessages: {
        type: Number,
        default: 0,
      },
      visionAnalyses: {
        type: Number,
        default: 0,
      },
      audioTranscriptions: {
        type: Number,
        default: 0,
      },
      imageGenerations: {
        type: Number,
        default: 0,
      },
      lastResetDate: {
        type: Date,
        default: Date.now,
      },
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ plan: 1, status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

// Methods
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && (!this.currentPeriodEnd || this.currentPeriodEnd > new Date());
};

subscriptionSchema.methods.canUseFeature = function(feature) {
  if (!this.isActive()) return false;
  
  const featureMap = {
    chat: 'chatMessages',
    vision: 'visionAnalyses',
    audio: 'audioTranscriptions',
    image: 'imageGenerations',
  };
  
  const usageKey = featureMap[feature];
  const limitKey = `${usageKey}PerMonth`;
  
  if (!usageKey || !this.features[limitKey]) return false;
  
  return this.usage[usageKey] < this.features[limitKey];
};

subscriptionSchema.methods.incrementUsage = async function(feature) {
  const featureMap = {
    chat: 'chatMessages',
    vision: 'visionAnalyses',
    audio: 'audioTranscriptions',
    image: 'imageGenerations',
  };
  
  const usageKey = featureMap[feature];
  if (!usageKey) return;
  
  this.usage[usageKey] += 1;
  await this.save();
};

subscriptionSchema.methods.resetUsage = async function() {
  this.usage.chatMessages = 0;
  this.usage.visionAnalyses = 0;
  this.usage.audioTranscriptions = 0;
  this.usage.imageGenerations = 0;
  this.usage.lastResetDate = new Date();
  await this.save();
};

// Static methods
subscriptionSchema.statics.getPlanFeatures = function(plan) {
  const plans = {
    free: {
      chatMessagesPerMonth: 50,
      visionAnalysesPerMonth: 5,
      audioTranscriptionsPerMonth: 10,
      imageGenerationsPerMonth: 0,
      vehiclesAllowed: 1,
      prioritySupport: false,
      advancedAnalytics: false,
    },
    premium: {
      chatMessagesPerMonth: 500,
      visionAnalysesPerMonth: 50,
      audioTranscriptionsPerMonth: 100,
      imageGenerationsPerMonth: 20,
      vehiclesAllowed: 5,
      prioritySupport: true,
      advancedAnalytics: false,
    },
    professional: {
      chatMessagesPerMonth: -1, // Unlimited
      visionAnalysesPerMonth: -1,
      audioTranscriptionsPerMonth: -1,
      imageGenerationsPerMonth: 100,
      vehiclesAllowed: -1,
      prioritySupport: true,
      advancedAnalytics: true,
    },
  };
  
  return plans[plan] || plans.free;
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
