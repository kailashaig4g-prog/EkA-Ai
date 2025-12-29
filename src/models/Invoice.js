const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'paid', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
      required: true,
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
      required: true,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    items: [
      {
        description: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      }
    ],
    billingDetails: {
      name: String,
      email: String,
      phone: String,
      address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
      },
      gstin: String, // For India GST compliance
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'razorpay', 'manual'],
    },
    paymentDetails: {
      transactionId: String,
      paymentIntentId: String,
      chargeId: String,
      receiptUrl: String,
    },
    stripeInvoiceId: {
      type: String,
      sparse: true,
    },
    razorpayInvoiceId: {
      type: String,
      sparse: true,
    },
    dueDate: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    period: {
      start: Date,
      end: Date,
    },
    notes: {
      type: String,
    },
    pdfUrl: {
      type: String,
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
invoiceSchema.index({ user: 1, createdAt: -1 });
invoiceSchema.index({ status: 1, dueDate: 1 });
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });

// Pre-save hook to generate invoice number
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, new Date().getMonth(), 1),
        $lt: new Date(year, new Date().getMonth() + 1, 1),
      }
    });
    this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Methods
invoiceSchema.methods.isPaid = function() {
  return this.status === 'paid';
};

invoiceSchema.methods.isOverdue = function() {
  return this.status === 'pending' && this.dueDate && this.dueDate < new Date();
};

invoiceSchema.methods.calculateGST = function(rate = 0.18) {
  // For India - 18% GST
  if (this.billingDetails && this.billingDetails.address && this.billingDetails.address.country === 'IN') {
    return this.amount * rate;
  }
  return 0;
};

invoiceSchema.methods.markAsPaid = async function(paymentDetails = {}) {
  this.status = 'paid';
  this.paidAt = new Date();
  this.paymentDetails = {
    ...this.paymentDetails,
    ...paymentDetails,
  };
  await this.save();
};

invoiceSchema.methods.markAsFailed = async function() {
  this.status = 'failed';
  await this.save();
};

invoiceSchema.methods.refund = async function() {
  this.status = 'refunded';
  await this.save();
};

// Static methods
invoiceSchema.statics.generateInvoiceNumber = async function() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const count = await this.countDocuments({
    createdAt: {
      $gte: new Date(year, new Date().getMonth(), 1),
      $lt: new Date(year, new Date().getMonth() + 1, 1),
    }
  });
  return `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
};

module.exports = mongoose.model('Invoice', invoiceSchema);
