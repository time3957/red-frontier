const mongoose = require('mongoose');

const { Schema, Types } = mongoose;

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

const enemySchema = new Schema({
  enemyId: { type: String },
  name: { type: String },
  hp: {
    current: { type: Number },
    max: { type: Number }
  },
  ac: { type: Number },
  suitIntegrity: {
    current: { type: Number },
    max: { type: Number }
  },
  status: { type: [String], default: [] }
}, { _id: false });

const combatLogSchema = new Schema({
  turn: { type: Number },
  actor: { type: String },
  action: { type: String },
  result: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const combatSchema = new Schema({
  active: { type: Boolean, default: false },
  turn: { type: Number, default: 0 },
  round: { type: Number, default: 1 },
  initiativeOrder: { type: Array, default: [] },
  enemies: { type: [enemySchema], default: [] },
  playerStatus: { type: [String], default: [] },
  log: { type: [combatLogSchema], default: [] }
}, { _id: false });

// ─── Main GameSession Schema ──────────────────────────────────────────────────

const gameSessionSchema = new Schema({
  playerId: {
    type: Types.ObjectId,
    ref: 'Player',
    required: [true, 'playerId is required']
  },
  sessionType: {
    type: String,
    enum: ['exploration', 'combat', 'dialogue', 'rest'],
    default: 'exploration'
  },
  combat: { type: combatSchema, default: () => ({}) },
  currentLocation: { type: String, default: 'ares_base_i' },
  updatedAt: { type: Date, default: Date.now }
});

// ─── Pre-save hook ────────────────────────────────────────────────────────────
gameSessionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('GameSession', gameSessionSchema);
