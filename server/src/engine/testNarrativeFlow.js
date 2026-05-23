/**
 * testNarrativeFlow.js — Automated Narrative Verification Script
 * Validates that all narrative nodes and choices connect properly, 
 * check conditions exist, and no dead-ends or invalid nextNodeId transitions occur.
 */

const narrativeNodes = require('../data/narrativeNodes');

console.log('🤖 Starting automated narrative flow verification...\n');

// 1. Map all node IDs
const nodeMap = {};
narrativeNodes.forEach(node => {
  nodeMap[node.nodeId] = node;
});

let errorCount = 0;
let warningCount = 0;
const verifiedNodes = new Set();
const verifiedChoices = new Set();

// 2. Validate nodes and their choices
narrativeNodes.forEach(node => {
  console.log(`Checking Node: [${node.nodeId}] - "${node.title}"`);
  verifiedNodes.add(node.nodeId);

  // Validate location exists in LOCATIONS
  if (!node.location) {
    console.log(`  ⚠️ WARNING: Node "${node.nodeId}" has no location defined.`);
    warningCount++;
  }

  // Validate atmosphere
  const validAtmospheres = ['calm', 'tense', 'horror', 'action'];
  if (!validAtmospheres.includes(node.atmosphere)) {
    console.log(`  ❌ ERROR: Node "${node.nodeId}" has invalid atmosphere: "${node.atmosphere}"`);
    errorCount++;
  }

  // Validate choices
  const choices = node.choices || [];
  if (choices.length === 0 && node.nodeId !== 'NODE_ACT1_ENDING' && node.nodeId !== 'NODE_CLASS_SELECT') {
    console.log(`  ⚠️ WARNING: Node "${node.nodeId}" has no choices (potential dead-end, except for endings).`);
    warningCount++;
  }

  choices.forEach(choice => {
    if (verifiedChoices.has(choice.choiceId)) {
      console.log(`  ❌ ERROR: Duplicate Choice ID found: "${choice.choiceId}" in Node "${node.nodeId}"`);
      errorCount++;
    }
    verifiedChoices.add(choice.choiceId);

    // Validate DC check
    if (choice.dcCheck) {
      const { stat, dc } = choice.dcCheck;
      const validStats = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
      if (!validStats.includes(stat.toLowerCase())) {
        console.log(`  ❌ ERROR: Choice "${choice.choiceId}" has invalid stat check: "${stat}"`);
        errorCount++;
      }
      if (typeof dc !== 'number' || dc <= 0) {
        console.log(`  ❌ ERROR: Choice "${choice.choiceId}" has invalid DC threshold: "${dc}"`);
        errorCount++;
      }
    }

    // Validate requirements
    if (choice.requirements) {
      const { class: reqClass, minStat, factionRep, evidence } = choice.requirements;
      if (reqClass && !['ranger', 'scientist', 'engineer', 'medic', 'augmented'].includes(reqClass.toLowerCase())) {
        console.log(`  ❌ ERROR: Choice "${choice.choiceId}" requires invalid class: "${reqClass}"`);
        errorCount++;
      }
      if (minStat && !['str', 'dex', 'con', 'int', 'wis', 'cha'].includes(minStat.stat.toLowerCase())) {
        console.log(`  ❌ ERROR: Choice "${choice.choiceId}" requirements has invalid stat: "${minStat.stat}"`);
        errorCount++;
      }
    }

    // Validate outcomes
    const outcomes = choice.outcomes || {};
    const outcomeKeys = Object.keys(outcomes);
    if (outcomeKeys.length === 0) {
      console.log(`  ❌ ERROR: Choice "${choice.choiceId}" has no outcomes defined.`);
      errorCount++;
    }

    outcomeKeys.forEach(outcomeKey => {
      const outcome = outcomes[outcomeKey];
      if (!outcome.nextNodeId) {
        console.log(`  ❌ ERROR: Choice "${choice.choiceId}" outcome "${outcomeKey}" lacks nextNodeId.`);
        errorCount++;
      } else {
        const nextNodeExists = !!nodeMap[outcome.nextNodeId];
        if (!nextNodeExists) {
          console.log(`  ❌ ERROR: Choice "${choice.choiceId}" outcome "${outcomeKey}" points to non-existent Node: "${outcome.nextNodeId}"`);
          errorCount++;
        } else {
          console.log(`    ➔ Choice [${choice.choiceId}] (${outcomeKey}) connects correctly to: [${outcome.nextNodeId}]`);
        }
      }

      // Check for valid state change types
      if (outcome.stateChanges) {
        const changes = Object.keys(outcome.stateChanges);
        changes.forEach(changeKey => {
          const validChanges = [
            'addEvidence', 'addEvidence2', 'xp', 'credits', 
            'humanityIndex', 'aresiumKnowledge', 'evansIdentityKnown', 
            'relayAgendaSuspected', 'dmitriMemoriesUnlocked', 'resetGame',
            'prometheus', 'forgotten', 'isu', 'settlers', 'o2', 'currentSI', 'currentHP', 'relayBeaconActive'
          ];
          if (!validChanges.includes(changeKey)) {
            console.log(`  ⚠️ WARNING: Choice "${choice.choiceId}" outcome "${outcomeKey}" modifies unmapped state variable: "${changeKey}"`);
            warningCount++;
          }
        });
      }
    });
  });

  console.log('--------------------------------------------------');
});

// 3. Validate Dialogue Nodes
console.log('\n💬 Checking Dialogue Nodes in dialogueNodes.js...');
const dialogueNodes = require('../data/dialogueNodes');
const dialogueNodeMap = {};

dialogueNodes.forEach(dNode => {
  console.log(`Checking Dialogue Node: [${dNode.dialogueId}] (NPC: ${dNode.npcId})`);
  dialogueNodeMap[dNode.dialogueId] = dNode;

  const choices = dNode.choices || [];
  if (choices.length === 0) {
    console.log(`  ❌ ERROR: Dialogue Node "${dNode.dialogueId}" has no choices.`);
    errorCount++;
  }

  choices.forEach(choice => {
    // Validate doesAdvanceNode is boolean
    if (typeof choice.doesAdvanceNode !== 'boolean') {
      console.log(`  ❌ ERROR: Choice "${choice.choiceId}" in Dialogue Node "${dNode.dialogueId}" lacks doesAdvanceNode boolean.`);
      errorCount++;
    }

    // Validate type / actionType
    const type = choice.type || choice.actionType;
    if (type !== 'dialogue' && type !== 'progress_story') {
      console.log(`  ❌ ERROR: Choice "${choice.choiceId}" has invalid type/actionType: "${type}".`);
      errorCount++;
    }

    // Validate topic and intent
    if (!choice.topic) {
      console.log(`  ❌ ERROR: Choice "${choice.choiceId}" has no topic.`);
      errorCount++;
    }
    if (!choice.intent) {
      console.log(`  ❌ ERROR: Choice "${choice.choiceId}" has no intent.`);
      errorCount++;
    }

    // Validate responseByRevealLevel
    const respObj = choice.responseByRevealLevel;
    if (!respObj || typeof respObj !== 'object') {
      console.log(`  ❌ ERROR: Choice "${choice.choiceId}" has invalid or missing responseByRevealLevel object.`);
      errorCount++;
    } else {
      const validLevels = ['HINT', 'PARTIAL', 'DEEP', 'FULL'];
      const levelsDefined = Object.keys(respObj).filter(lvl => validLevels.includes(lvl));
      if (levelsDefined.length === 0) {
        console.log(`  ❌ ERROR: Choice "${choice.choiceId}" responseByRevealLevel has no valid reveal level responses.`);
        errorCount++;
      }
    }

    // Validate nextNodeId if doesAdvanceNode is true
    if (choice.doesAdvanceNode) {
      if (!choice.nextNodeId) {
        console.log(`  ❌ ERROR: Choice "${choice.choiceId}" has doesAdvanceNode=true but lacks nextNodeId.`);
        errorCount++;
      } else {
        const nextNodeExists = !!nodeMap[choice.nextNodeId];
        if (!nextNodeExists) {
          console.log(`  ❌ ERROR: Choice "${choice.choiceId}" points to non-existent Node: "${choice.nextNodeId}".`);
          errorCount++;
        }
      }
    } else {
      // Validate followUpChoices
      if (!Array.isArray(choice.followUpChoices)) {
        console.log(`  ❌ ERROR: Choice "${choice.choiceId}" lacks followUpChoices array.`);
        errorCount++;
      } else {
        choice.followUpChoices.forEach(followUpId => {
          const followUpExists = dNode.choices.some(c => c.choiceId === followUpId);
          if (!followUpExists) {
            console.log(`  ❌ ERROR: Choice "${choice.choiceId}" has non-existent follow-up choice ID: "${followUpId}".`);
            errorCount++;
          }
        });
      }
    }
  });
});

// 4. Simulate Dialogue Engine Flow to verify DOES NOT ADVANCE Story Node
console.log('\n🧪 Simulating Dialogue Flow and State Transitions...');
const { resolveNode, resolveChoice } = require('./narrative');

const mockPlayer = {
  character: {
    class: 'ranger',
    stats: { int: 12, wis: 12, dex: 12, cha: 12, str: 12, con: 12 }
  },
  narrativeState: {
    currentNodeId: 'NODE_WARRENS_ENTRANCE',
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
      activeConversationId: null,
      lastPlayerChoiceId: null,
      lastPlayerIntent: null,
      lastTopic: null,
      awaitingAnswer: false,
      answeredTopics: [],
      unresolvedQuestions: [],
      nextChoiceIds: []
    }
  }
};

// Step 4.1: Enter Yara's Node
console.log('Simulating transition to NODE_MEET_YARA...');
mockPlayer.narrativeState.currentNodeId = 'NODE_MEET_YARA';
let resolvedNodeData = resolveNode('NODE_MEET_YARA', mockPlayer);

if (mockPlayer.narrativeState.dialogueState.activeConversationId !== 'DIA_YARA_TALK') {
  console.log('  ❌ ERROR: activeConversationId was not initialized to "DIA_YARA_TALK" on entering Yara node.');
  errorCount++;
} else {
  console.log('  ✅ activeConversationId initialized correctly to "DIA_YARA_TALK".');
}

// Step 4.2: Choose a question choice (doesAdvanceNode: false)
const testQuestionChoiceId = 'CHOICE_YARA_ASK_ARESIUM';
console.log(`Simulating choosing a question: "${testQuestionChoiceId}" (doesAdvanceNode = false)...`);
let choiceResult = resolveChoice(testQuestionChoiceId, mockPlayer);

if (choiceResult.nextNodeId !== 'NODE_MEET_YARA') {
  console.log(`  ❌ ERROR: Choice with doesAdvanceNode=false advanced story node to: "${choiceResult.nextNodeId}".`);
  errorCount++;
} else {
  console.log('  ✅ Player remained in NODE_MEET_YARA (Story Node did not advance prematurely).');
}

if (mockPlayer.narrativeState.dialogueState.lastPlayerChoiceId !== testQuestionChoiceId) {
  console.log(`  ❌ ERROR: lastPlayerChoiceId was not updated to "${testQuestionChoiceId}".`);
  errorCount++;
} else {
  console.log(`  ✅ lastPlayerChoiceId updated correctly to "${testQuestionChoiceId}".`);
}

const expectedFollowUps = ['CHOICE_YARA_ASK_RELAY7', 'CHOICE_YARA_ASK_EVANS', 'CHOICE_YARA_LEAVE'];
const actualFollowUps = mockPlayer.narrativeState.dialogueState.nextChoiceIds;
const match = expectedFollowUps.every(f => actualFollowUps.includes(f)) && expectedFollowUps.length === actualFollowUps.length;
if (!match) {
  console.log(`  ❌ ERROR: nextChoiceIds were not updated to the expected follow-ups: ${JSON.stringify(actualFollowUps)}.`);
  errorCount++;
} else {
  console.log('  ✅ nextChoiceIds updated to follow-up choices correctly.');
}

// Step 4.3: Choose exit choice (doesAdvanceNode: true)
console.log('Simulating choosing exit choice: "CHOICE_YARA_LEAVE" (doesAdvanceNode = true)...');
choiceResult = resolveChoice('CHOICE_YARA_LEAVE', mockPlayer);

if (choiceResult.nextNodeId !== 'NODE_ACT1_CLIMAX') {
  console.log(`  ❌ ERROR: Exit choice failed to transition to NODE_ACT1_CLIMAX. Next node: "${choiceResult.nextNodeId}".`);
  errorCount++;
} else {
  console.log('  ✅ Story Node advanced correctly to NODE_ACT1_CLIMAX.');
}

if (mockPlayer.narrativeState.dialogueState.activeConversationId !== null) {
  console.log('  ❌ ERROR: dialogueState was not cleared after doesAdvanceNode=true.');
  errorCount++;
} else {
  console.log('  ✅ dialogueState cleared successfully.');
}

// Step 4.4: Enter Dmitri's Node
console.log('Simulating transition to NODE_ACT1_CLIMAX...');
mockPlayer.narrativeState.currentNodeId = 'NODE_ACT1_CLIMAX';
resolvedNodeData = resolveNode('NODE_ACT1_CLIMAX', mockPlayer);

if (mockPlayer.narrativeState.dialogueState.activeConversationId !== 'DIA_DMITRI_TALK') {
  console.log('  ❌ ERROR: activeConversationId was not initialized to "DIA_DMITRI_TALK" on entering Dmitri node.');
  errorCount++;
} else {
  console.log('  ✅ activeConversationId initialized correctly to "DIA_DMITRI_TALK".');
}

// Step 4.5: Choose Dmitri question (doesAdvanceNode: false)
console.log('Simulating choosing Dmitri question: "CHOICE_DMITRI_ASK_MEMORIES" (doesAdvanceNode = false)...');
choiceResult = resolveChoice('CHOICE_DMITRI_ASK_MEMORIES', mockPlayer);

if (choiceResult.nextNodeId !== 'NODE_ACT1_CLIMAX') {
  console.log(`  ❌ ERROR: Choice with doesAdvanceNode=false advanced story node to: "${choiceResult.nextNodeId}".`);
  errorCount++;
} else {
  console.log('  ✅ Player remained in NODE_ACT1_CLIMAX (Story Node did not advance).');
}

// Step 4.6: Choose Dmitri exit (doesAdvanceNode: true)
console.log('Simulating choosing Dmitri exit: "CHOICE_DMITRI_LEAVE" (doesAdvanceNode = true)...');
choiceResult = resolveChoice('CHOICE_DMITRI_LEAVE', mockPlayer);

if (choiceResult.nextNodeId !== 'NODE_ACT1_ENDING') {
  console.log(`  ❌ ERROR: Exit choice failed to transition to NODE_ACT1_ENDING. Next node: "${choiceResult.nextNodeId}".`);
  errorCount++;
} else {
  console.log('  ✅ Story Node advanced correctly to NODE_ACT1_ENDING.');
}

if (mockPlayer.narrativeState.dialogueState.activeConversationId !== null) {
  console.log('  ❌ ERROR: dialogueState was not cleared after doesAdvanceNode=true.');
  errorCount++;
} else {
  console.log('  ✅ dialogueState cleared successfully.');
}

// 5. Print Summary
console.log('\n📊 Narrative & Dialogue Verification Summary:');
console.log(`  Total Story Nodes Checked:    ${verifiedNodes.size}`);
console.log(`  Total Dialogue Nodes Checked: ${dialogueNodes.length}`);
console.log(`  Errors Found:                 ${errorCount}`);
console.log(`  Warnings Found:               ${warningCount}`);

if (errorCount > 0) {
  console.log('\n❌ VERIFICATION FAILED: Please fix errors before deployment.');
  process.exit(1);
} else {
  console.log('\n✅ VERIFICATION SUCCESSFUL: All story nodes, dialogue systems, and flows are fully consistent!');
  process.exit(0);
}
