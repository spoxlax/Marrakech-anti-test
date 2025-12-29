const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  actorRole: {
    type: String,
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // or Profile, etc.
  },
  targetResource: {
    type: String, // 'User', 'Profile', 'Activity'
  },
  details: {
    type: Object, // Changed fields, specific permissions granted, etc.
  },
  status: {
    type: String, // 'SUCCESS', 'FAILURE'
    default: 'SUCCESS'
  },
  ipAddress: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
