const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // Optional if guest checkout
    index: true,
  },
  customerInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
  },
  date: {
    type: Date,
    required: true,
  },
  persons: {
    adults: { type: Number, default: 0 },
    children: { type: Number, default: 0 },
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
    index: true,
  },
  paymentMethod: {
    type: String,
    enum: ['CARD', 'CASH'],
    default: 'CARD',
  },
  confirmationCode: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  professionalPhotos: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
