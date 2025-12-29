const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    make: {
      type: String,
      required: [true, 'Please provide vehicle make'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Please provide vehicle model'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Please provide vehicle year'],
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    vin: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[A-HJ-NPR-Z0-9]{17}$/, 'Invalid VIN format'],
      sparse: true,
      unique: true,
    },
    licensePlate: {
      type: String,
      trim: true,
      uppercase: true,
    },
    color: {
      type: String,
      trim: true,
    },
    mileage: {
      type: Number,
      min: 0,
      default: 0,
    },
    fuelType: {
      type: String,
      enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'other'],
      default: 'gasoline',
    },
    transmission: {
      type: String,
      enum: ['automatic', 'manual', 'cvt', 'dct'],
      default: 'automatic',
    },
    engineSize: {
      type: String,
      trim: true,
    },
    purchaseDate: {
      type: Date,
    },
    lastServiceDate: {
      type: Date,
    },
    nextServiceDue: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot be more than 1000 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
vehicleSchema.index({ owner: 1 });
vehicleSchema.index({ vin: 1 }, { sparse: true });
vehicleSchema.index({ make: 1, model: 1, year: 1 });

// Virtual for full name
vehicleSchema.virtual('fullName').get(function () {
  return `${this.year} ${this.make} ${this.model}`;
});

// Ensure virtuals are included in JSON
vehicleSchema.set('toJSON', { virtuals: true });
vehicleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
