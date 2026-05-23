const mongoose = require('mongoose');

const { Schema } = mongoose;

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

const statsSchema = new Schema({
  str: { type: Number, default: 10 },
  dex: { type: Number, default: 10 },
  con: { type: Number, default: 10 },
  int: { type: Number, default: 10 },
  wis: { type: Number, default: 10 },
  cha: { type: Number, default: 10 }
}, { _id: false });

const hpSchema = new Schema({
  current: { type: Number, default: 50 },
  max: { type: Number, default: 50 }
}, { _id: false });

const siSchema = new Schema({
  current: { type: Number, default: 30 },
  max: { type: Number, default: 30 }
}, { _id: false });

const characterSchema = new Schema({
  name: { type: String },
  class: {
    type: String,
    enum: ['ranger', 'scientist', 'engineer', 'medic', 'augmented']
  },
  stats: { type: statsSchema, default: () => ({}) },
  hp: { type: hpSchema, default: () => ({}) },
  suitIntegrity: { type: siSchema, default: () => ({}) },
  o2: { type: Number, default: 100 },
  powerCell: { type: Number, default: 80 },
  radiationPoints: { type: Number, default: 0 },
  humanityIndex: { type: Number, default: 100 },
  sanity: { type: Number, default: 100 },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 }
}, { _id: false });

const cyberneticSchema = new Schema({
  id: { type: String },
  name: { type: String },
  tier: { type: Number },
  active: { type: Boolean },
  powerDrain: { type: Number }
}, { _id: false });

const inventoryItemSchema = new Schema({
  itemId: { type: String },
  name: { type: String },
  quantity: { type: Number },
  type: { type: String }
}, { _id: false });

const equippedWeaponSchema = new Schema({
  weaponId: { type: String },
  name: { type: String },
  damage: { type: String },
  tier: { type: Number }
}, { _id: false });

const hiddenVarsSchema = new Schema({
  aresiumKnowledge: { type: Number, default: 0 },
  evansIdentityKnown: { type: Boolean, default: false },
  relayAgendaSuspected: { type: Boolean, default: false },
  dmitriMemoriesUnlocked: { type: Number, default: 0 }
}, { _id: false });

const factionRepSchema = new Schema({
  isu: { type: Number, default: 0 },
  prometheus: { type: Number, default: 0 },
  settlers: { type: Number, default: 0 },
  forgotten: { type: Number, default: 0 }
}, { _id: false });

const evidenceBoardSchema = new Schema({
  collected: { type: [String], default: [] },
  completionPercent: { type: Number, default: 0 }
}, { _id: false });

const dialogueStateSchema = new Schema({
  activeConversationId: { type: String, default: null },
  lastPlayerChoiceId: { type: String, default: null },
  lastPlayerIntent: { type: String, default: null },
  lastTopic: { type: String, default: null },
  awaitingAnswer: { type: Boolean, default: false },
  answeredTopics: { type: [String], default: [] },
  unresolvedQuestions: { type: [String], default: [] },
  nextChoiceIds: { type: [String], default: [] }
}, { _id: false });

const knowledgeStateSchema = new Schema({
  knownFacts: { type: [String], default: [] },
  suspectedFacts: { type: [String], default: [] },
  unknownFacts: { type: [String], default: [] },
  revealLevels: {
    aresium: { type: String, enum: ['NONE', 'HINT', 'PARTIAL', 'DEEP', 'FULL'], default: 'NONE' },
    relay7: { type: String, enum: ['NONE', 'HINT', 'PARTIAL', 'DEEP', 'FULL'], default: 'NONE' },
    isuComplicity: { type: String, enum: ['NONE', 'HINT', 'PARTIAL', 'DEEP', 'FULL'], default: 'NONE' },
    aresProtocol: { type: String, enum: ['NONE', 'HINT', 'PARTIAL', 'DEEP', 'FULL'], default: 'NONE' },
    evans: { type: String, enum: ['NONE', 'HINT', 'PARTIAL', 'DEEP', 'FULL'], default: 'NONE' },
    dmitri_memory: { type: String, enum: ['NONE', 'HINT', 'PARTIAL', 'DEEP', 'FULL'], default: 'NONE' }
  }
}, { _id: false });

const narrativeStateSchema = new Schema({
  currentNodeId: { type: String, default: 'NODE_CLASS_SELECT' },
  actCurrent: { type: Number, default: 1 },
  hiddenVars: { type: hiddenVarsSchema, default: () => ({}) },
  factionRep: { type: factionRepSchema, default: () => ({}) },
  evidenceBoard: { type: evidenceBoardSchema, default: () => ({}) },
  visitedNodes: { type: [String], default: [] },
  completedQuests: { type: [String], default: [] },
  dialogueState: { type: dialogueStateSchema, default: () => ({}) },
  knowledgeState: { type: knowledgeStateSchema, default: () => ({}) }
}, { _id: false });

// ─── Main Player Schema ───────────────────────────────────────────────────────

const playerSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  character: { type: characterSchema, default: () => ({}) },
  cybernetics: { type: [cyberneticSchema], default: [] },
  inventory: { type: [inventoryItemSchema], default: [] },
  equippedWeapon: { type: equippedWeaponSchema, default: null },
  narrativeState: { type: narrativeStateSchema, default: () => ({}) },
  moralePoints: { type: Number, default: 5 },
  credits: { type: Number, default: 200 },
  createdAt: { type: Date, default: Date.now },
  lastSaved: { type: Date, default: Date.now }
});

// ─── Pre-save hook ────────────────────────────────────────────────────────────
playerSchema.pre('save', function (next) {
  this.lastSaved = Date.now();
  next();
});

module.exports = mongoose.model('Player', playerSchema);
