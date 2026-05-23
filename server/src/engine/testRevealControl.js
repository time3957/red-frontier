/**
 * testRevealControl.js — Automated Verification Script for Reveal Control & Canon Truth System.
 * Run this test to verify all Act restrictions, NPC scopes, evidence checks, and amnesia locks.
 */

const { resolveChoice, resolveNode } = require('./narrative');
const { getMaxRevealLevel, checkRevealAllowed, getAllowedDialogueResponse } = require('./revealControl');
const dialogueNodes = require('../data/dialogueNodes');

console.log('🧪 Starting automated Reveal Control Verification...\n');

let errorCount = 0;
let successCount = 0;

// Helper to log test outcomes
const assert = (condition, message) => {
  if (condition) {
    console.log(`  ✅ SUCCESS: ${message}`);
    successCount++;
  } else {
    console.log(`  ❌ FAILURE: ${message}`);
    errorCount++;
  }
};

// Mock Player creator
const createMockPlayer = () => ({
  character: {
    class: 'ranger',
    stats: { int: 12, wis: 12, dex: 12, cha: 12, str: 12, con: 12 }
  },
  narrativeState: {
    currentNodeId: 'NODE_MEET_YARA',
    actCurrent: 1,
    hiddenVars: {
      aresiumKnowledge: 0,
      evansIdentityKnown: false,
      relayAgendaSuspected: false,
      dmitriMemoriesUnlocked: 0
    },
    factionRep: { isu: 0, prometheus: 0, settlers: 0, forgotten: 0 },
    evidenceBoard: { collected: [], completionPercent: 0 },
    visitedNodes: [],
    completedQuests: [],
    dialogueState: {
      activeConversationId: 'DIA_YARA_TALK',
      lastPlayerChoiceId: null,
      lastPlayerIntent: null,
      lastTopic: null,
      awaitingAnswer: false,
      answeredTopics: [],
      unresolvedQuestions: [],
      nextChoiceIds: []
    },
    knowledgeState: {
      knownFacts: [],
      suspectedFacts: [],
      unknownFacts: [],
      revealLevels: { aresium: 'NONE', relay7: 'NONE', isuComplicity: 'NONE', aresProtocol: 'NONE' }
    }
  }
});

// ----------------------------------------------------
// Test 1: Act I Yara Dialogue: Yara Aresium question returns HINT response
// ----------------------------------------------------
const player1 = createMockPlayer();
player1.narrativeState.actCurrent = 1;
player1.narrativeState.evidenceBoard.collected = []; // No evidence

const choiceYaraAresium = dialogueNodes.find(d => d.dialogueId === 'DIA_YARA_TALK').choices.find(c => c.choiceId === 'CHOICE_YARA_ASK_ARESIUM');

let response = getAllowedDialogueResponse(choiceYaraAresium, 'yara', player1);
assert(
  response.includes('ปอดคนงานเหมืองตกผลึก') && !response.includes('Martian Hive') && !response.includes('เศษซากของสิ่งมีชีวิตโบราณ'),
  'Act I Yara Aresium question returns HINT response (lung crystallization, no Martian Hive reveal).'
);

// ----------------------------------------------------
// Test 2: Act I Yara Dialogue: Yara RELAY-7 question returns HINT response
// ----------------------------------------------------
const choiceYaraRelay = dialogueNodes.find(d => d.dialogueId === 'DIA_YARA_TALK').choices.find(c => c.choiceId === 'CHOICE_YARA_ASK_RELAY7');
response = getAllowedDialogueResponse(choiceYaraRelay, 'yara', player1);
assert(
  response.includes('Phobos') && !response.includes('อัปโหลดจิตสำนึก') && !response.includes('Convergence'),
  'Act I Yara RELAY-7 question returns HINT response (Phobos mention, no soul upload/Convergence reveal).'
);

// ----------------------------------------------------
// Test 3: Dmitri Memory Lock: dmitriMemoriesUnlocked = 0 returns evasive response, dmitriMemoriesUnlocked = 1 returns HINT
// ----------------------------------------------------
const playerDmitri = createMockPlayer();
playerDmitri.narrativeState.currentNodeId = 'NODE_ACT1_CLIMAX';
playerDmitri.narrativeState.dialogueState.activeConversationId = 'DIA_DMITRI_TALK';
playerDmitri.narrativeState.hiddenVars.dmitriMemoriesUnlocked = 0;

const choiceDmitriMem = dialogueNodes.find(d => d.dialogueId === 'DIA_DMITRI_TALK').choices.find(c => c.choiceId === 'CHOICE_DMITRI_ASK_MEMORIES');
response = getAllowedDialogueResponse(choiceDmitriMem, 'dmitri', playerDmitri);
assert(
  response.includes('นึกอะไรไม่ออกจริงๆ') || response.includes('เจ็บหัวไปหมด'),
  'Dmitri amnesia lock (unlocked = 0) returns evasive fallback response.'
);

playerDmitri.narrativeState.hiddenVars.dmitriMemoriesUnlocked = 1;
response = getAllowedDialogueResponse(choiceDmitriMem, 'dmitri', playerDmitri);
assert(
  response.includes('Phobos') && !response.includes('วิศวกรเพื่อนยาก') && !response.includes('ล้างความทรงจำ'),
  'Dmitri memory level 1 returns HINT response.'
);

// ----------------------------------------------------
// Test 4: Required evidence requirement check
// ----------------------------------------------------
const playerEvidence = createMockPlayer();
playerEvidence.narrativeState.actCurrent = 2; // Act II allows up to PARTIAL
playerEvidence.narrativeState.evidenceBoard.collected = []; // But NO evidence collected

response = getAllowedDialogueResponse(choiceYaraAresium, 'yara', playerEvidence);
assert(
  response.includes('ปอดคนงานเหมืองตกผลึก') && !response.includes('โครงการแพทย์ Azrael'),
  'Asking Yara in Act II with missing evidence degrades response to HINT.'
);

playerEvidence.narrativeState.evidenceBoard.collected = ['CLUE_ARESIUM_SAMPLE'];
response = getAllowedDialogueResponse(choiceYaraAresium, 'yara', playerEvidence);
assert(
  response.includes('โครงการแพทย์ Azrael'),
  'Asking Yara in Act II with CLUE_ARESIUM_SAMPLE successfully returns PARTIAL response.'
);

// ----------------------------------------------------
// Test 5: Act IV Yara is restricted to DEEP, but relay7_npc can reveal FULL
// ----------------------------------------------------
const playerAct4 = createMockPlayer();
playerAct4.narrativeState.actCurrent = 4; // Act IV
playerAct4.narrativeState.evidenceBoard.collected = ['CLUE_ARESIUM_SAMPLE'];

// Yara is capped at DEEP for aresium even in Act IV
response = getAllowedDialogueResponse(choiceYaraAresium, 'yara', playerAct4);
assert(
  response.includes('ไซแนปส์ประสาท') && !response.includes('Martian Hive') && !response.includes('เศษซากของสิ่งมีชีวิตโบราณ'),
  'Yara in Act IV is restricted to DEEP response for Aresium (no Martian Hive/FULL truth).'
);

// relay7_npc has FULL capability in Act IV
const isFullAllowedForRelay7 = checkRevealAllowed('aresium', 'relay7_npc', playerAct4, 'FULL');
assert(
  isFullAllowedForRelay7 === true,
  'relay7_npc in Act IV with required evidence is allowed to reveal FULL truth of Aresium.'
);


// ----------------------------------------------------
// Test 6: Dialogue Continuity (same story node)
// ----------------------------------------------------
const playerContinuity = createMockPlayer();
const choiceResult = resolveChoice('CHOICE_YARA_ASK_ARESIUM', playerContinuity);
assert(
  choiceResult.nextNodeId === 'NODE_MEET_YARA' && choiceResult.doesAdvanceNode === false,
  'Dialogue choice resolves without advancing the story node.'
);
// ----------------------------------------------------
// Test 7: Phase 2.5 Audit & Lock Verification
// ----------------------------------------------------
console.log('\n🔍 Running Phase 2.5 Audit & Lock Verification...');

// 7.1 Topic Validation (topic in dialogueNodes.js must be in canonTruth.js or whitelisted)
const CANON_TRUTH = require('../data/canonTruth');
const whitelistTopics = ['leave'];
let topicsValid = true;
dialogueNodes.forEach(dNode => {
  dNode.choices.forEach(choice => {
    if (choice.topic && !CANON_TRUTH[choice.topic] && !whitelistTopics.includes(choice.topic)) {
      console.log(`  ❌ ERROR: Choice "${choice.choiceId}" uses unmapped topic: "${choice.topic}"`);
      topicsValid = false;
    }
  });
});
assert(topicsValid, 'All dialogue choice topics exist in canonTruth.js (or are whitelisted).');

// 7.2 NPC Scope Validation (npcId in dialogueNodes.js must exist in npcKnowledgeScope.js)
const { NPC_KNOWLEDGE_SCOPE } = require('../data/npcKnowledgeScope');
let npcScopesValid = true;
dialogueNodes.forEach(dNode => {
  if (!NPC_KNOWLEDGE_SCOPE[dNode.npcId]) {
    console.log(`  ❌ ERROR: NPC ID "${dNode.npcId}" has no defined knowledge scope configuration.`);
    npcScopesValid = false;
  }
});
assert(npcScopesValid, 'All NPC IDs used in dialogue nodes exist in npcKnowledgeScope.js.');

// 7.3 Required Evidence DB verification
const fs = require('fs');
const path = require('path');
const seedPath = path.join(__dirname, '../seed.js');
let seedClues = [];
try {
  const seedContent = fs.readFileSync(seedPath, 'utf8');
  const regex = /clueId:\s*["'](CLUE_[A-Z0-9_]+)["']/g;
  let match;
  while ((match = regex.exec(seedContent)) !== null) {
    seedClues.push(match[1]);
  }
} catch (err) {
  console.log(`  ⚠️ Warning: Could not parse seed.js for verification: ${err.message}`);
}

let requiredEvidenceValid = true;
Object.keys(CANON_TRUTH).forEach(key => {
  const truthObj = CANON_TRUTH[key];
  if (truthObj.requiredEvidence && !seedClues.includes(truthObj.requiredEvidence)) {
    console.log(`  ❌ ERROR: Topic "${key}" requires evidence "${truthObj.requiredEvidence}" which is missing from seed.js.`);
    requiredEvidenceValid = false;
  }
});
assert(requiredEvidenceValid, 'All requiredEvidence defined in canonTruth.js are seeded in seed.js.');

// 7.4 Act I Yara/Dmitri Dialogue Leak Check (No Martian Hive, Neural Medium, soul upload, Convergence)
let leakDetected = false;
const testAct1Player = createMockPlayer();
testAct1Player.narrativeState.actCurrent = 1;
testAct1Player.narrativeState.hiddenVars.dmitriMemoriesUnlocked = 1; // Allow Dmitri to talk

const forbiddenKeywords = ['Martian Hive', 'Neural Medium', 'soul upload', 'Convergence'];

dialogueNodes.forEach(dNode => {
  dNode.choices.forEach(choice => {
    const resp = getAllowedDialogueResponse(choice, dNode.npcId, testAct1Player);
    forbiddenKeywords.forEach(word => {
      if (resp.toLowerCase().includes(word.toLowerCase())) {
        console.log(`  ❌ ERROR: Leak detected in Act I response for choice "${choice.choiceId}" (${dNode.npcId}): Contains "${word}"`);
        leakDetected = true;
      }
    });
  });
});
assert(!leakDetected, 'Act I responses do not contain forbidden endgame terms (Martian Hive, Neural Medium, soul upload, Convergence).');

// 7.5 Yara Act IV Capped at DEEP (No FULL response / Martian Hive)
const testAct4PlayerYara = createMockPlayer();
testAct4PlayerYara.narrativeState.actCurrent = 4;
testAct4PlayerYara.narrativeState.evidenceBoard.collected = ['CLUE_ARESIUM_SAMPLE'];
const yaraAct4AresiumResponse = getAllowedDialogueResponse(choiceYaraAresium, 'yara', testAct4PlayerYara);
assert(
  !yaraAct4AresiumResponse.includes('Martian Hive') && !yaraAct4AresiumResponse.includes('เศษซากของสิ่งมีชีวิตโบราณ'),
  'Yara Aresium response in Act IV is capped at DEEP (no FULL Martian Hive reveal).'
);

// 7.6 RELAY-7 Act IV with evidence returns FULL
const testAct4PlayerRelay = createMockPlayer();
testAct4PlayerRelay.narrativeState.actCurrent = 4;
testAct4PlayerRelay.narrativeState.evidenceBoard.collected = ['CLUE_ARESIUM_SAMPLE', 'CLUE_RELAY7_CONTACT'];
const isFullAllowedRelay7 = checkRevealAllowed('relay7', 'relay7_npc', testAct4PlayerRelay, 'FULL');
assert(isFullAllowedRelay7 === true, 'RELAY-7 in Act IV with required evidence is allowed to reveal FULL agenda.');

// 7.7 Save game compatibility (Old save without knowledgeState)
const testOldPlayer = createMockPlayer();
delete testOldPlayer.narrativeState.knowledgeState; // Simulate old save
let oldSaveResolves = false;
try {
  const resp = getAllowedDialogueResponse(choiceYaraAresium, 'yara', testOldPlayer);
  oldSaveResolves = typeof resp === 'string';
} catch (err) {
  console.log('  ❌ Old save resolve crashed:', err.message);
  oldSaveResolves = false;
}
assert(oldSaveResolves, 'Old save game without knowledgeState resolves correctly without crashing.');

// Summary log
console.log('\n📊 Test Results Summary:');
console.log(`  Tests Passed: ${successCount}`);
console.log(`  Tests Failed: ${errorCount}`);

if (errorCount > 0) {
  console.log('\n❌ VERIFICATION FAILED: Some Reveal Control tests failed.');
  process.exit(1);
} else {
  console.log('\n✅ VERIFICATION SUCCESSFUL: All Reveal Control rules and filters are working perfectly!');
  process.exit(0);
}
