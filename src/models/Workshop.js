const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide workshop name'],
      trim: true,
      maxlength: [200, 'Name cannot be more than 200 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide phone number'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    specialties: [
      {
        type: String,
        trim: true,
      },
    ],
    certifications: [
      {
        type: String,
        trim: true,
      },
    ],
    workingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    images: [
      {
        url: String,
        caption: String,
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
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
workshopSchema.index({ location: '2dsphere' });
workshopSchema.index({ name: 'text', description: 'text' });
workshopSchema.index({ rating: -1 });
workshopSchema.index({ 'address.city': 1, 'address.state': 1 });

// Virtual for full address
workshopSchema.virtual('fullAddress').get(function () {
  if (!this.address) return '';
  const { street, city, state, zipCode, country } = this.address;
  return [street, city, state, zipCode, country].filter(Boolean).join(', ');
});

// Ensure virtuals are included in JSON
workshopSchema.set('toJSON', { virtuals: true });
workshopSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Workshop', workshopSchema);
