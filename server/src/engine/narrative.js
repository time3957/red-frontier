/**
 * narrative.js — Narrative/story node resolver
 * Handles node resolution, choice validation, state changes, and ending conditions.
 */

const narrativeNodes = require('../data/narrativeNodes');
const dialogueNodes = require('../data/dialogueNodes');
const { rollWithModifier, getModifier, getOutcome, getNarrativeResult } = require('./dice');

// ─── Node lookup map ──────────────────────────────────────────────────────────

const nodeMap = {};
narrativeNodes.forEach(node => {
  nodeMap[node.nodeId] = node;
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Check if a player meets the requirements for a choice.
 * @param {Object} requirements
 * @param {Object} player
 * @returns {boolean}
 */
const meetsRequirements = (requirements, player) => {
  if (!requirements) return true;

  const char = player.character || {};
  const narrativeState = player.narrativeState || {};
  const factionRep = narrativeState.factionRep || {};
  const evidenceBoard = narrativeState.evidenceBoard || {};

  // Class requirement
  if (requirements.class && char.class !== requirements.class) return false;

  // Minimum stat requirement
  if (requirements.minStat) {
    const { stat, value } = requirements.minStat;
    if ((char.stats?.[stat] ?? 10) < value) return false;
  }

  // Faction reputation requirement
  if (requirements.factionRep) {
    const { faction, minRep } = requirements.factionRep;
    if ((factionRep[faction] ?? 0) < minRep) return false;
  }

  // Evidence requirement
  if (requirements.evidence) {
    const collected = evidenceBoard.collected || [];
    if (!collected.includes(requirements.evidence)) return false;
  }

  return true;
};

// ─── resolveNode ──────────────────────────────────────────────────────────────

/**
 * Resolve a narrative node — return node data and filtered available choices.
 * @param {string} nodeId
 * @param {Object} player
 * @returns {{ node: Object, availableChoices: Array, narrative: string, onEnter: Object|null }}
 */
const resolveNode = (nodeId, player) => {
  // Initialize dialogueState if we are entering a dialogue-specific node
  if (player && player.narrativeState) {
    if (!player.narrativeState.dialogueState) {
      player.narrativeState.dialogueState = {
        activeConversationId: null,
        lastPlayerChoiceId: null,
        lastPlayerIntent: null,
        lastTopic: null,
        awaitingAnswer: false,
        answeredTopics: [],
        unresolvedQuestions: [],
        nextChoiceIds: []
      };
    }
    
    if (nodeId === 'NODE_MEET_YARA' && player.narrativeState.dialogueState.activeConversationId !== 'DIA_YARA_TALK') {
      player.narrativeState.dialogueState.activeConversationId = 'DIA_YARA_TALK';
      player.narrativeState.dialogueState.nextChoiceIds = ['CHOICE_YARA_ASK_ARESIUM', 'CHOICE_YARA_ASK_RELAY7', 'CHOICE_YARA_ASK_EVANS', 'CHOICE_YARA_LEAVE'];
      player.narrativeState.dialogueState.lastPlayerChoiceId = null;
      player.narrativeState.dialogueState.lastPlayerIntent = null;
      player.narrativeState.dialogueState.lastTopic = null;
      player.narrativeState.dialogueState.awaitingAnswer = false;
    } else if (nodeId === 'NODE_ACT1_CLIMAX' && player.narrativeState.dialogueState.activeConversationId !== 'DIA_DMITRI_TALK') {
      player.narrativeState.dialogueState.activeConversationId = 'DIA_DMITRI_TALK';
      player.narrativeState.dialogueState.nextChoiceIds = ['CHOICE_DMITRI_ASK_MEMORIES', 'CHOICE_DMITRI_ASK_EVANS', 'CHOICE_DMITRI_ASK_RELAY7', 'CHOICE_DMITRI_LEAVE'];
      player.narrativeState.dialogueState.lastPlayerChoiceId = null;
      player.narrativeState.dialogueState.lastPlayerIntent = null;
      player.narrativeState.dialogueState.lastTopic = null;
      player.narrativeState.dialogueState.awaitingAnswer = false;
    }
  }

  const node = nodeMap[nodeId];

  if (!node) {
    return {
      node: null,
      availableChoices: [],
      narrative: `[ข้อผิดพลาด: ไม่พบโหนด ${nodeId}]`,
      onEnter: null
    };
  }

  // Check if Dialogue Mode is active
  const activeConversationId = player?.narrativeState?.dialogueState?.activeConversationId;
  if (activeConversationId) {
    const dialogueNode = dialogueNodes.find(d => d.dialogueId === activeConversationId);
    if (dialogueNode) {
      const nextChoiceIds = player.narrativeState.dialogueState.nextChoiceIds || [];
      const currentChoices = nextChoiceIds.length > 0
        ? dialogueNode.choices.filter(c => nextChoiceIds.includes(c.choiceId))
        : dialogueNode.choices;

      const availableChoices = currentChoices.filter(choice =>
        meetsRequirements(choice.requirements, player)
      ).map(choice => ({
        choiceId: choice.choiceId,
        text: choice.text,
        hasDCCheck: !!choice.dcCheck,
        dcStat: choice.dcCheck?.stat || null,
        actionType: choice.actionType || choice.type || 'dialogue',
        type: choice.type || 'dialogue'
      }));

      // Determine narrative text (either the last NPC response or the node narrative)
      let narrativeText = node.narrative;
      if (player.narrativeState.dialogueState.lastPlayerChoiceId) {
        const lastChoiceId = player.narrativeState.dialogueState.lastPlayerChoiceId;
        const choiceObj = dialogueNode.choices.find(c => c.choiceId === lastChoiceId);
        if (choiceObj) {
          const { getAllowedDialogueResponse } = require('./revealControl');
          narrativeText = getAllowedDialogueResponse(choiceObj, dialogueNode.npcId, player);
        }
      }

      return {
        node: {
          nodeId: node.nodeId,
          title: node.title,
          location: node.location,
          atmosphere: node.atmosphere
        },
        narrative: narrativeText,
        availableChoices,
        onEnter: node.onEnter || null
      };
    }
  }

  // Filter choices by requirements (Standard Node)
  const availableChoices = (node.choices || []).filter(choice =>
    meetsRequirements(choice.requirements, player)
  ).map(choice => ({
    choiceId: choice.choiceId,
    text: choice.text,
    hasDCCheck: !!choice.dcCheck,
    dcStat: choice.dcCheck?.stat || null,
    actionType: choice.actionType || choice.type || 'progress_story',
    type: choice.type || 'progress_story'
  }));

  return {
    node: {
      nodeId: node.nodeId,
      title: node.title,
      location: node.location,
      atmosphere: node.atmosphere
    },
    narrative: node.narrative,
    availableChoices,
    onEnter: node.onEnter || null
  };
};

// ─── resolveChoice ────────────────────────────────────────────────────────────

/**
 * Resolve a player's choice — roll dice if needed, determine outcome, apply state changes.
 * @param {string} choiceId
 * @param {Object} player
 * @returns {{ nextNodeId: string, outcome: string, stateChanges: Object, narrative: string, rollInfo: Object|null }}
 */
const resolveChoice = (choiceId, player) => {
  // 1. Find in dialogue nodes first
  let foundChoice = null;
  let foundDialogueNode = null;

  for (const dNode of dialogueNodes) {
    const choice = (dNode.choices || []).find(c => c.choiceId === choiceId);
    if (choice) {
      foundChoice = choice;
      foundDialogueNode = dNode;
      break;
    }
  }

  if (foundChoice) {
    const stateChanges = { ...(foundChoice.stateChanges || {}) };
    let nextNodeId = player.narrativeState?.currentNodeId || 'NODE_MEET_YARA';

    if (foundChoice.doesAdvanceNode) {
      nextNodeId = foundChoice.nextNodeId;
      // Clear dialogueState
      if (player && player.narrativeState && player.narrativeState.dialogueState) {
        player.narrativeState.dialogueState.activeConversationId = null;
        player.narrativeState.dialogueState.lastPlayerChoiceId = null;
        player.narrativeState.dialogueState.lastPlayerIntent = null;
        player.narrativeState.dialogueState.lastTopic = null;
        player.narrativeState.dialogueState.awaitingAnswer = false;
        player.narrativeState.dialogueState.nextChoiceIds = [];
      }
    } else {
      // Update dialogueState
      if (player && player.narrativeState) {
        if (!player.narrativeState.dialogueState) {
          player.narrativeState.dialogueState = {
            activeConversationId: null,
            lastPlayerChoiceId: null,
            lastPlayerIntent: null,
            lastTopic: null,
            awaitingAnswer: false,
            answeredTopics: [],
            unresolvedQuestions: [],
            nextChoiceIds: []
          };
        }
        player.narrativeState.dialogueState.activeConversationId = foundDialogueNode.dialogueId;
        player.narrativeState.dialogueState.lastPlayerChoiceId = choiceId;
        player.narrativeState.dialogueState.lastPlayerIntent = foundChoice.intent || 'question';
        player.narrativeState.dialogueState.lastTopic = foundChoice.topic || null;
        player.narrativeState.dialogueState.awaitingAnswer = false;
        
        if (!player.narrativeState.dialogueState.answeredTopics) {
          player.narrativeState.dialogueState.answeredTopics = [];
        }
        if (foundChoice.topic && !player.narrativeState.dialogueState.answeredTopics.includes(foundChoice.topic)) {
          player.narrativeState.dialogueState.answeredTopics.push(foundChoice.topic);
        }
        
        player.narrativeState.dialogueState.nextChoiceIds = foundChoice.followUpChoices || [];
      }
    }

    const { getAllowedDialogueResponse } = require('./revealControl');
    const responseText = getAllowedDialogueResponse(foundChoice, foundDialogueNode.npcId, player);

    return {
      nextNodeId,
      outcome: 'success',
      stateChanges,
      narrative: responseText,
      rollInfo: null,
      choiceId,
      isDialogue: true,
      doesAdvanceNode: foundChoice.doesAdvanceNode
    };
  }

  // 2. Otherwise find the choice in narrative nodes
  let foundNode = null;

  for (const node of narrativeNodes) {
    const choice = (node.choices || []).find(c => c.choiceId === choiceId);
    if (choice) {
      foundChoice = choice;
      foundNode = node;
      break;
    }
  }

  if (!foundChoice) {
    return {
      nextNodeId: player.narrativeState?.currentNodeId || 'NODE_CLASS_SELECT',
      outcome: 'failure',
      stateChanges: {},
      narrative: `[ข้อผิดพลาด: ไม่พบตัวเลือก ${choiceId}]`,
      rollInfo: null
    };
  }

  let outcome = 'success';
  let rollInfo = null;
  let resultData = null;

  // Roll dice if choice has DC check
  if (foundChoice.dcCheck) {
    const { stat, dc } = foundChoice.dcCheck;
    const statScore = player.character?.stats?.[stat] ?? 10;
    const modifier = getModifier(statScore);
    const rollResult = rollWithModifier(modifier);
    outcome = getOutcome(rollResult, dc);
    rollInfo = {
      stat,
      dc,
      raw: rollResult.raw,
      modifier,
      total: rollResult.total,
      outcome,
      narrativeResult: getNarrativeResult(outcome)
    };
  }

  // Select outcome data — fall back to success if specific outcome not defined
  const outcomes = foundChoice.outcomes || {};
  resultData = outcomes[outcome] || outcomes.success || outcomes.failure || {
    nextNodeId: foundNode.nodeId,
    narrative: 'ผลลัพธ์ไม่ชัดเจน...',
    stateChanges: {}
  };

  // Apply state changes
  const stateChanges = { ...(resultData.stateChanges || {}) };

  // If a standard narrative choice triggers a node transition, clear the dialogue state
  if (player && player.narrativeState && player.narrativeState.dialogueState) {
    player.narrativeState.dialogueState.activeConversationId = null;
    player.narrativeState.dialogueState.lastPlayerChoiceId = null;
    player.narrativeState.dialogueState.lastPlayerIntent = null;
    player.narrativeState.dialogueState.lastTopic = null;
    player.narrativeState.dialogueState.awaitingAnswer = false;
    player.narrativeState.dialogueState.nextChoiceIds = [];
  }

  return {
    nextNodeId: resultData.nextNodeId,
    outcome,
    stateChanges,
    narrative: resultData.narrative,
    rollInfo,
    choiceId
  };
};

// ─── checkEndingConditions ────────────────────────────────────────────────────

/**
 * Check if the player has reached an ending condition.
 * @param {Object} player
 * @returns {{ ending: number|null, reason: string }}
 */
const checkEndingConditions = (player) => {
  const char = player.character || {};
  const narrativeState = player.narrativeState || {};
  const hiddenVars = narrativeState.hiddenVars || {};
  const factionRep = narrativeState.factionRep || {};
  const evidenceBoard = narrativeState.evidenceBoard || {};

  // Ending 1 — Death (HP = 0 and no death saves)
  if ((char.hp?.current ?? 1) <= 0) {
    return { ending: 1, reason: 'ตาย — HP หมด' };
  }

  // Ending 2 — Sanity collapse (join the Forgotten)
  if ((char.sanity ?? 100) <= 0 && (factionRep.forgotten ?? 0) >= 30) {
    return { ending: 2, reason: 'จิตใจพังทลาย — กลายเป็นหนึ่งใน Forgotten' };
  }

  // Ending 3 — ISU Victory (high ISU rep, evidence exposed)
  if (
    (factionRep.isu ?? 0) >= 50 &&
    (evidenceBoard.completionPercent ?? 0) >= 80 &&
    narrativeState.completedQuests?.includes('expose_prometheus')
  ) {
    return { ending: 3, reason: 'ชัยชนะ ISU — ความจริงถูกเปิดเผย' };
  }

  // Ending 4 — Prometheus Compromise (high Prometheus rep)
  if ((factionRep.prometheus ?? 0) >= 60) {
    return { ending: 4, reason: 'ข้อตกลง Prometheus — คุณเลือกข้าง' };
  }

  // Ending 5 — True ending (all evidence, RELAY-7 truth discovered)
  if (
    (evidenceBoard.completionPercent ?? 0) >= 100 &&
    (hiddenVars.aresiumKnowledge ?? 0) >= 5 &&
    hiddenVars.evansIdentityKnown &&
    hiddenVars.relayAgendaSuspected
  ) {
    return { ending: 5, reason: 'ความจริงสูงสุด — ความลับของ Aresium และ RELAY-7 ถูกเปิดเผยทั้งหมด' };
  }

  return { ending: null, reason: null };
};

// ─── getClassStartNode ────────────────────────────────────────────────────────

/**
 * Get the starting node ID for a given player class.
 * @param {string} playerClass
 * @returns {string} nodeId
 */
const getClassStartNode = (playerClass) => {
  const classNodes = {
    ranger: 'NODE_RANGER_START',
    scientist: 'NODE_SCIENTIST_START',
    engineer: 'NODE_ENGINEER_START',
    medic: 'NODE_MEDIC_START',
    augmented: 'NODE_AUGMENTED_START'
  };
  return classNodes[playerClass] || 'NODE_RANGER_START';
};

module.exports = {
  resolveNode,
  resolveChoice,
  checkEndingConditions,
  getClassStartNode
};
