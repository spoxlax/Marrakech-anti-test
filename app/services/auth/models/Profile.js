const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  permissions: [{
    type: String,
  }],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure profile names are unique per owner
profileSchema.index({ name: 1, ownerId: 1 }, { unique: true });

module.exports = mongoose.model('Profile', profileSchema);
