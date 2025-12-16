const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true, // One review per booking
  },
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Review', reviewSchema);
