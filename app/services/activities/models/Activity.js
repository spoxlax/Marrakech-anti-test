const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priceAdult: {
    type: Number,
    required: true,
  },
  priceChild: {
    type: Number,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  maxParticipants: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    default: 'Marrakech'
  },
  averageRating: {
    type: Number,
    default: 0
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  }
});

activitySchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Activity', activitySchema);
