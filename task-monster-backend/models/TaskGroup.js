const mongoose = require('mongoose');

const taskGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  monster_name: {
    type: String,
    default: 'Monster'
  },
  monster_image: {
    type: String
  },
  monster_dnd_index: {
    type: String
  },
  monster_hp: {
    type: Number
  },
  monster_defeat_recorded: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#6B21A8'
  },
  participants: [{
    type: String,
    trim: true
  }],
  adventuring_party_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdventuringParty'
  },
  students: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true
    }
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
taskGroupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TaskGroup', taskGroupSchema);