const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    index: 'text', // Enable text search
  },
  description: {
    type: String,
    required: true,
  },
  priceAdult: {
    type: Number,
    required: true,
    index: true,
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
    index: true,
  },
  city: {
    type: String,
    default: 'Marrakech',
    index: true,
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
activitySchema.index({ averageRating: -1 });

module.exports = mongoose.model('Activity', activitySchema);
