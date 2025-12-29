const mongoose = require('mongoose');

const serviceHistorySchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceType: {
      type: String,
      required: [true, 'Please provide service type'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide service description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    workshop: {
      type: String,
      trim: true,
    },
    mileageAtService: {
      type: Number,
      min: 0,
    },
    cost: {
      type: Number,
      min: 0,
    },
    parts: [
      {
        name: String,
        quantity: Number,
        cost: Number,
      },
    ],
    laborCost: {
      type: Number,
      min: 0,
    },
    serviceDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    nextServiceDate: {
      type: Date,
    },
    nextServiceMileage: {
      type: Number,
      min: 0,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['completed', 'in-progress', 'scheduled'],
      default: 'completed',
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot be more than 1000 characters'],
    },
    attachments: [
      {
        url: String,
        filename: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
serviceHistorySchema.index({ vehicle: 1, serviceDate: -1 });
serviceHistorySchema.index({ user: 1 });
serviceHistorySchema.index({ serviceDate: -1 });

// Virtual for total cost
serviceHistorySchema.virtual('totalCost').get(function () {
  const partsCost = this.parts.reduce((sum, part) => sum + (part.cost || 0), 0);
  return partsCost + (this.laborCost || 0) + (this.cost || 0);
});

// Ensure virtuals are included in JSON
serviceHistorySchema.set('toJSON', { virtuals: true });
serviceHistorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ServiceHistory', serviceHistorySchema);
