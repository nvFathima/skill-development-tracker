const mongoose = require('mongoose');

const ConcernSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Review', 'Resolved'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  replies: [{
    message: String,
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});

module.exports = mongoose.model('concerns', ConcernSchema);