const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  conditions: {
    visits: {
      min: {
        type: Number,
        required: true
      },
      max: {
        type: Number,
        required: true
      }
    },
    totalSpent: {
      min: {
        type: Number,
        required: true
      },
      max: {
        type: Number,
        required: true
      }
    }
  },
  campaignName: {
    type: String,
    required: true,
    trim: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Segment', segmentSchema);