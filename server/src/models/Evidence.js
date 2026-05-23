const mongoose = require('mongoose');

const { Schema } = mongoose;

const evidenceSchema = new Schema({
  clueId: {
    type: String,
    required: [true, 'clueId is required'],
    unique: true
  },
  title: { type: String },
  description: { type: String },
  fullText: { type: String }, // detailed content when examined
  act: { type: Number },
  location: { type: String },
  type: {
    type: String,
    enum: ['report', 'document', 'audio', 'video', 'digital', 'medical', 'classified', 'personal']
  },
  connectsTo: { type: [String], default: [] }, // other clueIds
  requiredClass: { type: String, default: null }, // null = any class can find
  requiredStat: {
    stat: { type: String },
    dc: { type: Number }
  },
  unlocks: { type: String, default: null }, // narrative layer unlocked
  found: { type: Boolean, default: false }
});

module.exports = mongoose.model('Evidence', evidenceSchema);
