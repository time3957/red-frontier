/**
 * revealControl.js — Narrative Reveal Control engine for Red Frontier.
 * Regulates what information is allowed to be disclosed based on current Act, NPC knowledge, and evidence.
 */

const CANON_TRUTH = require('../data/canonTruth');
const { NPC_KNOWLEDGE_SCOPE } = require('../data/npcKnowledgeScope');

const LEVELS_ORDER = ['NONE', 'HINT', 'PARTIAL', 'DEEP', 'FULL'];

/**
 * Gets the maximum allowed reveal level for a given topic and NPC.
 * Intersects Act limit, NPC knowledge scope, and Dmitri amnesia locks.
 * @param {string} topic
 * @param {string} npcId
 * @param {Object} player
 * @returns {string} One of 'NONE', 'HINT', 'PARTIAL', 'DEEP', 'FULL'
 */
const getMaxRevealLevel = (topic, npcId, player) => {
  if (!player || !player.narrativeState) {
    return 'HINT'; // Safe default
  }

  // 1. Act Limit Capping
  const actCurrent = player.narrativeState.actCurrent || 1;
  let actMax = 'HINT';
  if (actCurrent === 2) actMax = 'PARTIAL';
  else if (actCurrent === 3) actMax = 'DEEP';
  else if (actCurrent >= 4) actMax = 'FULL';

  let maxLevel = actMax;

  // 2. NPC Knowledge Scope Capping
  const npcScope = NPC_KNOWLEDGE_SCOPE[npcId];
  if (npcScope) {
    // Check if topic is forbidden before current Act
    const forbiddenAct = npcScope.forbiddenTopicsBeforeAct?.[topic];
    if (forbiddenAct && actCurrent < forbiddenAct) {
      return 'NONE';
    }

    const npcMax = npcScope.maxRevealLevelByAct?.[topic]?.[actCurrent] || 'HINT';
    
    // Choose the minimum of actMax and npcMax
    if (LEVELS_ORDER.indexOf(npcMax) < LEVELS_ORDER.indexOf(maxLevel)) {
      maxLevel = npcMax;
    }
  }

  // 3. Dmitri Amnesia Lock Capping
  if (npcId === 'dmitri') {
    const unlocked = player.narrativeState.hiddenVars?.dmitriMemoriesUnlocked ?? 0;
    const dmitriMax = LEVELS_ORDER[Math.min(unlocked, 4)] || 'NONE';
    
    if (LEVELS_ORDER.indexOf(dmitriMax) < LEVELS_ORDER.indexOf(maxLevel)) {
      maxLevel = dmitriMax;
    }
  }

  return maxLevel;
};

/**
 * Verifies if a specific reveal level is allowed for a topic, NPC, and player.
 * @param {string} topic
 * @param {string} npcId
 * @param {Object} player
 * @param {string} targetRevealLevel
 * @returns {boolean}
 */
const checkRevealAllowed = (topic, npcId, player, targetRevealLevel) => {
  const maxAllowed = getMaxRevealLevel(topic, npcId, player);
  if (LEVELS_ORDER.indexOf(targetRevealLevel) > LEVELS_ORDER.indexOf(maxAllowed)) {
    return false;
  }

  // Check required evidence for truth level
  const truth = CANON_TRUTH[topic];
  if (truth && truth.requiredEvidence && targetRevealLevel !== 'HINT' && targetRevealLevel !== 'NONE') {
    const collected = player.narrativeState?.evidenceBoard?.collected || [];
    if (!collected.includes(truth.requiredEvidence)) {
      return false;
    }
  }

  return true;
};

/**
 * Returns the highest allowed dialogue response for a choice, based on reveal controls.
 * @param {Object} choice
 * @param {string} npcId
 * @param {Object} player
 * @returns {string} The formatted NPC response text
 */
const getAllowedDialogueResponse = (choice, npcId, player) => {
  const topic = choice.topic;
  let maxAllowed = getMaxRevealLevel(topic, npcId, player);

  // Downgrade to HINT if required evidence is missing
  const truth = CANON_TRUTH[topic];
  if (truth && truth.requiredEvidence) {
    const collected = player.narrativeState?.evidenceBoard?.collected || [];
    if (!collected.includes(truth.requiredEvidence)) {
      if (LEVELS_ORDER.indexOf(maxAllowed) > LEVELS_ORDER.indexOf('HINT')) {
        maxAllowed = 'HINT';
      }
    }
  }

  // Find the highest available response within maxAllowed
  const responses = choice.responseByRevealLevel || {};
  let selectedLevel = 'NONE';
  
  for (let i = LEVELS_ORDER.indexOf(maxAllowed); i >= 0; i--) {
    const checkLevel = LEVELS_ORDER[i];
    if (responses[checkLevel]) {
      selectedLevel = checkLevel;
      break;
    }
  }

  // Update knowledgeState from this dialogue selection
  if (selectedLevel !== 'NONE' && selectedLevel !== 'HINT') {
    updateKnowledgeStateFromDialogue(topic, selectedLevel, player);
  }

  // Return response or fallback evasive response
  if (selectedLevel === 'NONE' || !responses[selectedLevel]) {
    if (npcId === 'yara') {
      return `"ฉันว่าเรายังมีเรื่องสำคัญกว่าเรื่องนั้นที่ต้องคุยกัน... ไว้พร้อมกว่านี้ค่อยกลับมาคุยกันเถอะ"`;
    } else if (npcId === 'dmitri') {
      return `"หัวของฉันมันส่งเสียงแปลกๆ ตลอดเวลา... เจ็บหัวไปหมด นึกอะไรไม่ออกจริงๆ..."`;
    } else {
      return `"หัวของฉันมันเบลอไปหมด... นึกเรื่องนั้นไม่ออกจริงๆ... ไว้เราพร้อมกว่านี้ค่อยกลับมาคุยกันเถอะ"`;
    }
  }

  return responses[selectedLevel];
};

/**
 * Updates player knowledgeState when finding a piece of evidence.
 * @param {string} evidenceId
 * @param {Object} player
 */
const updateKnowledgeStateFromEvidence = (evidenceId, player) => {
  if (!player || !player.narrativeState) return;

  if (!player.narrativeState.knowledgeState) {
    player.narrativeState.knowledgeState = {
      knownFacts: [],
      suspectedFacts: [],
      unknownFacts: [],
      revealLevels: { aresium: 'NONE', relay7: 'NONE', isuComplicity: 'NONE', aresProtocol: 'NONE' }
    };
  }

  const kState = player.narrativeState.knowledgeState;
  if (!kState.knownFacts) kState.knownFacts = [];
  if (!kState.suspectedFacts) kState.suspectedFacts = [];
  if (!kState.revealLevels) {
    kState.revealLevels = { aresium: 'NONE', relay7: 'NONE', isuComplicity: 'NONE', aresProtocol: 'NONE' };
  }

  // Map evidence to topics
  const evidenceTopicMap = {
    CLUE_ARESIUM_SAMPLE: 'aresium',
    CLUE_RELAY7_CONTACT: 'relay7',
    CLUE_VASQUEZ_WARNING: 'isuComplicity',
    CLUE_AZRAEL_PROTOCOL: 'aresProtocol'
  };

  const topic = evidenceTopicMap[evidenceId];
  if (topic) {
    if (!kState.knownFacts.includes(evidenceId)) {
      kState.knownFacts.push(evidenceId);
    }
    
    // Set to HINT if currently NONE
    if (kState.revealLevels[topic] === 'NONE') {
      kState.revealLevels[topic] = 'HINT';
    }
  }
};

/**
 * Updates player knowledgeState when obtaining information from a dialogue.
 * @param {string} topic
 * @param {string} revealLevel
 * @param {Object} player
 */
const updateKnowledgeStateFromDialogue = (topic, revealLevel, player) => {
  if (!player || !player.narrativeState) return;

  if (!player.narrativeState.knowledgeState) {
    player.narrativeState.knowledgeState = {
      knownFacts: [],
      suspectedFacts: [],
      unknownFacts: [],
      revealLevels: { aresium: 'NONE', relay7: 'NONE', isuComplicity: 'NONE', aresProtocol: 'NONE' }
    };
  }

  const kState = player.narrativeState.knowledgeState;
  if (!kState.revealLevels) {
    kState.revealLevels = { aresium: 'NONE', relay7: 'NONE', isuComplicity: 'NONE', aresProtocol: 'NONE' };
  }

  // Update level only if it is higher than the current known level
  const currentLevel = kState.revealLevels[topic] || 'NONE';
  if (LEVELS_ORDER.indexOf(revealLevel) > LEVELS_ORDER.indexOf(currentLevel)) {
    kState.revealLevels[topic] = revealLevel;
    
    // Add to known/suspected facts as appropriate
    const factName = `${topic}_${revealLevel.toLowerCase()}`;
    if (revealLevel === 'DEEP' || revealLevel === 'FULL') {
      if (!kState.knownFacts.includes(factName)) {
        kState.knownFacts.push(factName);
      }
    } else {
      if (!kState.suspectedFacts.includes(factName)) {
        kState.suspectedFacts.push(factName);
      }
    }
  }
};

module.exports = {
  getMaxRevealLevel,
  checkRevealAllowed,
  getAllowedDialogueResponse,
  updateKnowledgeStateFromEvidence,
  updateKnowledgeStateFromDialogue
};
