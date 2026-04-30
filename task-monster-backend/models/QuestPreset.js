const mongoose = require('mongoose');

const questPresetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    max: 999,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('QuestPreset', questPresetSchema);
