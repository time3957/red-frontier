const express = require('express');
const Player = require('../models/Player');
const GameSession = require('../models/GameSession');
const Evidence = require('../models/Evidence');
const { verifyToken } = require('../middleware/auth');
const { formatPlayer } = require('./character');

// Engines and Data
const { resolveNode, resolveChoice } = require('../engine/narrative');
const { tickO2, tickRadiation, tickThermal, tickSanity, applyDamageToSuit } = require('../engine/survival');
const { rollInitiative, resolveAttack, resolveEnemyAttack } = require('../engine/combat');
const enemyTemplates = require('../data/enemies');

const router = express.Router();

// Helper to format combat state for client
function formatCombat(combat) {
  if (!combat || !combat.active) {
    return { active: false, round: 1, turn: 'player', enemies: [], log: [], initiativeOrder: [], lastResult: null };
  }
  return {
    active: combat.active,
    round: combat.round,
    turn: combat.turn || 'player',
    enemies: (combat.enemies || []).map((e, idx) => ({
      id: e.enemyId || `enemy_${idx}`,
      name: e.name,
      hp: e.hp?.current ?? 0,
      maxHp: e.hp?.max ?? 0,
      si: e.suitIntegrity?.current ?? 0,
      maxSi: e.suitIntegrity?.max ?? 0,
      ac: e.ac || 10,
      statusEffects: e.status || [],
      icon: e.enemyId?.includes('drone') ? '🤖' : e.enemyId?.includes('guard') ? '👮' : '👾',
      type: e.enemyId?.includes('elite') ? 'ELITE' : 'HOSTILE'
    })),
    log: (combat.log || []).map(l => ({
      type: l.actor === 'player' ? 'player' : l.actor === 'system' ? 'system' : 'enemy',
      text: l.result
    })),
    initiativeOrder: (combat.initiativeOrder || []).map(actor => ({
      id: actor.id,
      name: actor.name,
      initiative: actor.initiative
    })),
    lastResult: combat.lastResult
  };
}

// Get or create game session for player
async function getOrCreateSession(playerId) {
  let session = await GameSession.findOne({ playerId });
  if (!session) {
    session = new GameSession({
      playerId,
      sessionType: 'exploration',
      currentLocation: 'ares_base_i',
      combat: { active: false }
    });
    await session.save();
  }
  return session;
}

// ─── Get Game State ───────────────────────────────────────
router.get('/state', verifyToken, async (req, res) => {
  try {
    const player = await Player.findById(req.user.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    if (!player.character || !player.character.name) {
      return res.status(404).json({ message: 'Character not created yet' });
    }

    const session = await getOrCreateSession(player._id);
    
    // Resolve current narrative node
    const currentNodeId = player.narrativeState?.currentNodeId || 'NODE_RANGER_START';
    const resolved = resolveNode(currentNodeId, player);

    // Format choices to client requirements
    const formattedChoices = (resolved.availableChoices || []).map(choice => {
      // Look up original choice for DC/requirements check
      const nodeObj = require('../data/narrativeNodes').find(n => n.nodeId === currentNodeId);
      let originalChoice = nodeObj?.choices?.find(c => c.choiceId === choice.choiceId);
      if (!originalChoice) {
        const dialogueNodes = require('../data/dialogueNodes');
        originalChoice = dialogueNodes.flatMap(d => d.choices).find(c => c.choiceId === choice.choiceId);
      }

      let reqStr = null;
      let reqMet = true;

      if (originalChoice?.requirements) {
        const req = originalChoice.requirements;
        if (req.class) {
          reqStr = `CLASS: ${req.class.toUpperCase()}`;
          reqMet = player.character.class === req.class;
        } else if (req.minStat) {
          reqStr = `${req.minStat.stat.toUpperCase()} >= ${req.minStat.value}`;
          reqMet = (player.character.stats?.[req.minStat.stat] ?? 10) >= req.minStat.value;
        } else if (req.evidence) {
          reqStr = `EVIDENCE: ${req.evidence}`;
          reqMet = player.narrativeState.evidenceBoard?.collected?.includes(req.evidence);
        }
      }

      let diff = null;
      if (originalChoice?.dcCheck) {
        const dc = originalChoice.dcCheck.dc;
        diff = dc >= 16 ? 'Hard' : dc >= 12 ? 'Medium' : 'Easy';
      }

      return {
        id: choice.choiceId,
        text: choice.text,
        requirement: reqStr,
        requirementMet: reqMet,
        difficulty: diff,
        actionType: choice.actionType || 'dialogue',
        type: choice.type || 'dialogue'
      };
    });

    res.json({
      player: formatPlayer(player),
      narrative: {
        currentNode: currentNodeId,
        nodeText: resolved.narrative,
        choices: formattedChoices,
        location: resolved.node?.location || 'Unknown Sector',
        atmosphere: resolved.node?.atmosphere || 'calm',
        hazards: []
      },
      combat: formatCombat(session.combat),
      evidence: {
        collected: player.narrativeState?.evidenceBoard?.collected || [],
        total: 12,
        completionPercent: player.narrativeState?.evidenceBoard?.completionPercent || 0
      }
    });
  } catch (err) {
    console.error('Get game state error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Post Narrative Action ────────────────────────────────
router.post('/action', verifyToken, async (req, res) => {
  try {
    const { choiceId, nodeId } = req.body;
    const player = await Player.findById(req.user.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const session = await getOrCreateSession(player._id);

    // Resolve choice using the D20 narrative engine
    const choiceResolution = resolveChoice(choiceId, player);
    const nextNodeId = choiceResolution.nextNodeId;
    const outcome = choiceResolution.outcome;
    const stateChanges = choiceResolution.stateChanges || {};

    // Apply state changes to player
    if (stateChanges.resetGame) {
      player.character = undefined;
      player.credits = 200;
      player.narrativeState = {
        currentNodeId: 'NODE_CLASS_SELECT',
        actCurrent: 1,
        hiddenVars: {
          aresiumKnowledge: 0,
          evansIdentityKnown: false,
          relayAgendaSuspected: false,
          dmitriMemoriesUnlocked: 0
        },
        factionRep: {
          isu: 0,
          prometheus: 0,
          settlers: 0,
          forgotten: 0
        },
        evidenceBoard: {
          collected: [],
          completionPercent: 0
        },
        visitedNodes: ['NODE_CLASS_SELECT'],
        completedQuests: []
      };
      await player.save();
      session.combat = { active: false };
      session.sessionType = 'exploration';
      await session.save();

      return res.json({
        player: { id: player._id, username: player.username, email: player.email, name: '' },
        narrative: {
          currentNode: 'NODE_CLASS_SELECT',
          nodeText: choiceResolution.narrative,
          choices: [],
          location: 'ares_base_i',
          atmosphere: 'calm',
          hazards: []
        },
        combat: formatCombat(null)
      });
    }

    if (stateChanges.addEvidence) {
      if (!player.narrativeState.evidenceBoard.collected.includes(stateChanges.addEvidence)) {
        player.narrativeState.evidenceBoard.collected.push(stateChanges.addEvidence);
        const { updateKnowledgeStateFromEvidence } = require('../engine/revealControl');
        updateKnowledgeStateFromEvidence(stateChanges.addEvidence, player);
      }
    }
    if (stateChanges.addEvidence2) {
      if (!player.narrativeState.evidenceBoard.collected.includes(stateChanges.addEvidence2)) {
        player.narrativeState.evidenceBoard.collected.push(stateChanges.addEvidence2);
        const { updateKnowledgeStateFromEvidence } = require('../engine/revealControl');
        updateKnowledgeStateFromEvidence(stateChanges.addEvidence2, player);
      }
    }
    if (stateChanges.xp) player.character.xp += stateChanges.xp;
    if (stateChanges.credits) player.credits = Math.max(0, player.credits + stateChanges.credits);
    if (stateChanges.humanityIndex) player.character.humanityIndex = Math.max(0, Math.min(100, player.character.humanityIndex + stateChanges.humanityIndex));
    if (stateChanges.aresiumKnowledge) player.narrativeState.hiddenVars.aresiumKnowledge += stateChanges.aresiumKnowledge;
    if (stateChanges.evansIdentityKnown) player.narrativeState.hiddenVars.evansIdentityKnown = stateChanges.evansIdentityKnown;
    if (stateChanges.relayAgendaSuspected) player.narrativeState.hiddenVars.relayAgendaSuspected = stateChanges.relayAgendaSuspected;
    if (stateChanges.dmitriMemoriesUnlocked) player.narrativeState.hiddenVars.dmitriMemoriesUnlocked += stateChanges.dmitriMemoriesUnlocked;

    // Apply survival resource ticks
    const location = session.currentLocation || 'ares_base_i';
    const hasO2Recycler = player.cybernetics?.some(c => c.id === 'o2_recycler' && c.active);
    
    const o2Tick = tickO2(player, location, hasO2Recycler);
    const radTick = tickRadiation(player, location);
    const sanityTick = tickSanity(player);

    player.character.o2 = o2Tick.newO2;
    player.character.radiationPoints = radTick.newRadPoints;
    player.character.sanity = sanityTick.newSanity;

    // Combine story text with survival warning text if any
    let narrativeText = choiceResolution.narrative;
    if (o2Tick.narrative) narrativeText += `\n\n${o2Tick.narrative}`;
    if (radTick.narrative) narrativeText += `\n\n${radTick.narrative}`;
    if (sanityTick.narrative) narrativeText += `\n\n${sanityTick.narrative}`;

    // Update current node ID
    player.narrativeState.currentNodeId = nextNodeId;
    if (!player.narrativeState.visitedNodes.includes(nextNodeId)) {
      player.narrativeState.visitedNodes.push(nextNodeId);
    }

    // Resolve the NEW node to check for enter triggers (like combat)
    const newResolvedNode = resolveNode(nextNodeId, player);
    
    // Check if new node triggers combat
    if (newResolvedNode.onEnter?.triggerCombat) {
      const combatData = newResolvedNode.onEnter.triggerCombat;
      const combatEnemies = (combatData.enemies || []).map((enemyId, idx) => {
        const template = enemyTemplates.find(e => e.enemyId === enemyId) || {
          name: 'Prometheus Security Guard', hp: 30, ac: 14, si: 20, attacks: [{ name: 'Rifle Shot', damage: '1d8+3' }]
        };
        return {
          enemyId: `${enemyId}_${idx}`,
          name: template.name,
          hp: { current: template.hp, max: template.hp },
          ac: template.ac,
          suitIntegrity: { current: template.si, max: template.si },
          status: [],
          attacks: template.attacks
        };
      });

      // Roll initiative
      const initiative = rollInitiative(player.character.stats.dex, combatEnemies);
      
      session.combat = {
        active: true,
        round: 1,
        turn: initiative[0]?.id || 'player',
        enemies: combatEnemies,
        playerStatus: [],
        initiativeOrder: initiative.map(actor => ({
          id: actor.id,
          name: actor.name,
          initiative: actor.initiative
        })),
        log: [{
          turn: 1,
          actor: 'system',
          action: 'start',
          result: 'เริ่มการต่อสู้! ศัตรูบุกโจมตี!',
          timestamp: new Date()
        }]
      };
      session.sessionType = 'combat';
    }

    // Recalculate evidence completion percent
    player.narrativeState.evidenceBoard.completionPercent = Math.round(
      (player.narrativeState.evidenceBoard.collected.length / 12) * 100
    );

    player.markModified('narrativeState');

    await player.save();
    await session.save();

    // Format new choices for the next node
    const formattedChoices = (newResolvedNode.availableChoices || []).map(choice => {
      const nodeObj = require('../data/narrativeNodes').find(n => n.nodeId === nextNodeId);
      let originalChoice = nodeObj?.choices?.find(c => c.choiceId === choice.choiceId);
      if (!originalChoice) {
        const dialogueNodes = require('../data/dialogueNodes');
        originalChoice = dialogueNodes.flatMap(d => d.choices).find(c => c.choiceId === choice.choiceId);
      }

      let reqStr = null;
      let reqMet = true;

      if (originalChoice?.requirements) {
        const req = originalChoice.requirements;
        if (req.class) {
          reqStr = `CLASS: ${req.class.toUpperCase()}`;
          reqMet = player.character.class === req.class;
        } else if (req.minStat) {
          reqStr = `${req.minStat.stat.toUpperCase()} >= ${req.minStat.value}`;
          reqMet = (player.character.stats?.[req.minStat.stat] ?? 10) >= req.minStat.value;
        } else if (req.evidence) {
          reqStr = `EVIDENCE: ${req.evidence}`;
          reqMet = player.narrativeState.evidenceBoard?.collected?.includes(req.evidence);
        }
      }

      let diff = null;
      if (originalChoice?.dcCheck) {
        const dc = originalChoice.dcCheck.dc;
        diff = dc >= 16 ? 'Hard' : dc >= 12 ? 'Medium' : 'Easy';
      }

      return {
        id: choice.choiceId,
        text: choice.text,
        requirement: reqStr,
        requirementMet: reqMet,
        difficulty: diff,
        actionType: choice.actionType || 'dialogue',
        type: choice.type || 'dialogue'
      };
    });

    res.json({
      diceRoll: choiceResolution.rollInfo,
      player: formatPlayer(player),
      narrative: {
        currentNode: nextNodeId,
        nodeText: (choiceResolution.isDialogue && !choiceResolution.doesAdvanceNode)
          ? narrativeText
          : narrativeText + `\n\n${newResolvedNode.narrative}`,
        choices: formattedChoices,
        location: newResolvedNode.node?.location || 'Unknown Sector',
        atmosphere: newResolvedNode.node?.atmosphere || 'calm',
        hazards: []
      },
      combat: formatCombat(session.combat)
    });

  } catch (err) {
    console.error('Post narrative action error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Start Combat ─────────────────────────────────────────
router.post('/combat/start', verifyToken, async (req, res) => {
  try {
    const { location } = req.body;
    const player = await Player.findById(req.user.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });

    const session = await getOrCreateSession(player._id);

    // Default combat encounter: 2 guards
    const combatEnemies = [
      {
        enemyId: 'prometheus_guard_1',
        name: 'Prometheus Security Guard',
        hp: { current: 30, max: 30 },
        ac: 14,
        suitIntegrity: { current: 20, max: 20 },
        status: [],
        attacks: [{ name: 'Rifle Shot', damage: '1d8+3' }]
      }
    ];

    const initiative = rollInitiative(player.character.stats.dex, combatEnemies);

    session.combat = {
      active: true,
      round: 1,
      turn: initiative[0]?.id || 'player',
      enemies: combatEnemies,
      playerStatus: [],
      initiativeOrder: initiative.map(actor => ({
        id: actor.id,
        name: actor.name,
        initiative: actor.initiative
      })),
      log: [{
        turn: 1,
        actor: 'system',
        action: 'start',
        result: 'เริ่มการต่อสู้ในพื้นที่!',
        timestamp: new Date()
      }]
    };
    session.sessionType = 'combat';

    await session.save();

    res.json({
      combatState: formatCombat(session.combat),
      initiativeOrder: session.combat.initiativeOrder,
      narrative: 'ระบบตรวจจับภัยคุกคาม! เตรียมอาวุธรับมือ!'
    });
  } catch (err) {
    console.error('Start combat error:', err);
    res.status(500).json({ message: 'Server error starting combat' });
  }
});

// ─── Post Combat Action ───────────────────────────────────
router.post('/combat/action', verifyToken, async (req, res) => {
  try {
    const { action, targetId } = req.body;
    const player = await Player.findById(req.user.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });

    const session = await getOrCreateSession(player._id);

    if (!session.combat || !session.combat.active) {
      return res.status(400).json({ message: 'No active combat session' });
    }

    let diceRollInfo = null;
    const logEntries = [];

    // Player action
    if (action === 'attack') {
      const enemyIndex = session.combat.enemies.findIndex(e => e.enemyId === targetId);
      if (enemyIndex === -1 || session.combat.enemies[enemyIndex].hp.current <= 0) {
        return res.status(400).json({ message: 'Invalid target' });
      }

      const enemy = session.combat.enemies[enemyIndex];
      const weapon = player.equippedWeapon || { name: 'Pistol', damage: '1d8+1' };
      
      const attackRes = resolveAttack(player, weapon, enemy);
      
      // Apply damage to enemy
      session.combat.enemies[enemyIndex].hp.current = attackRes.newEnemyHp;
      session.combat.enemies[enemyIndex].suitIntegrity.current = attackRes.newEnemySI;

      // Add to log
      session.combat.log.push({
        turn: session.combat.round,
        actor: 'player',
        action: 'attack',
        result: attackRes.narrative,
        timestamp: new Date()
      });

      diceRollInfo = {
        roll: attackRes.rollResult.raw,
        type: 'attack',
        outcome: attackRes.isCrit ? 'critSuccess' : attackRes.hit ? 'success' : 'failure',
        narrative: attackRes.narrative
      };
    } else if (action === 'dodge') {
      // Dodge grants temporary protection or defense
      session.combat.log.push({
        turn: session.combat.round,
        actor: 'player',
        action: 'dodge',
        result: 'คุณเตรียมพร้อมหลบหลีกการโจมตีถัดไป',
        timestamp: new Date()
      });
    } else if (action === 'flee') {
      // Try to flee (50% chance)
      const fleeSuccess = Math.random() > 0.5;
      if (fleeSuccess) {
        session.combat.active = false;
        session.sessionType = 'exploration';
        await session.save();
        return res.json({
          combatResult: { type: 'defeat', text: 'คุณตัดสินใจวิ่งหนีจากการต่อสู้ เอาชีวิตรอดไปก่อน!' },
          player: formatPlayer(player),
          combat: formatCombat(session.combat)
        });
      } else {
        session.combat.log.push({
          turn: session.combat.round,
          actor: 'player',
          action: 'flee',
          result: 'คุณพยายามหนีแต่ถูกดักไว้!',
          timestamp: new Date()
        });
      }
    }

    // Check if all enemies are defeated
    const allEnemiesDefeated = session.combat.enemies.every(e => e.hp.current <= 0);
    
    if (allEnemiesDefeated) {
      // Player won combat!
      session.combat.active = false;
      session.sessionType = 'exploration';

      // Award XP
      player.character.xp += 150;
      player.credits += 50;

      // Move player node to outcome
      const currentNodeId = player.narrativeState.currentNodeId;
      const originalNode = require('../data/narrativeNodes').find(n => n.nodeId === currentNodeId);
      const engageChoice = originalNode?.choices?.find(c => c.choiceId === 'CHOICE_COMBAT_ENGAGE');
      const successNodeId = engageChoice?.outcomes?.success?.nextNodeId || 'NODE_WARRENS_ENTRANCE';
      
      player.narrativeState.currentNodeId = successNodeId;
      if (!player.narrativeState.visitedNodes.includes(successNodeId)) {
        player.narrativeState.visitedNodes.push(successNodeId);
      }

      await player.save();
      await session.save();

      return res.json({
        combatResult: {
          type: 'victory',
          text: 'การต่อสู้สิ้นสุด คุณเอาชนะกองกำลัง Prometheus สำเร็จ!',
          rewards: { xp: 150, credits: 50 }
        },
        player: formatPlayer(player),
        combat: formatCombat(session.combat)
      });
    }

    // Enemy Turn — resolve enemy counter-attacks
    session.combat.enemies.forEach(enemy => {
      if (enemy.hp.current > 0) {
        const enemyAttackRes = resolveEnemyAttack(enemy, player);
        
        // Apply damage to player
        player.character.hp.current = enemyAttackRes.newPlayerHp;
        player.character.suitIntegrity.current = enemyAttackRes.newSI;

        // Log entry
        session.combat.log.push({
          turn: session.combat.round,
          actor: enemy.name,
          action: 'attack',
          result: enemyAttackRes.narrative,
          timestamp: new Date()
        });
      }
    });

    // Check if player died
    if (player.character.hp.current <= 0) {
      session.combat.active = false;
      session.sessionType = 'exploration';
      
      // Defeat! Reset player to safe state and safe node
      player.character.hp.current = 10;
      player.character.suitIntegrity.current = player.character.suitIntegrity.max;
      player.narrativeState.currentNodeId = 'NODE_ESCAPE_TUNNEL';

      await player.save();
      await session.save();

      return res.json({
        combatResult: {
          type: 'defeat',
          text: 'คุณได้รับบาดเจ็บสาหัสและหมดสติไป... ร่างของคุณถูกลากมาทิ้งใน Maintenance Tunnel'
        },
        player: formatPlayer(player),
        combat: formatCombat(session.combat)
      });
    }

    // Increment round
    session.combat.round += 1;
    
    await player.save();
    await session.save();

    res.json({
      diceRoll: diceRollInfo,
      player: formatPlayer(player),
      combat: formatCombat(session.combat)
    });
  } catch (err) {
    console.error('Post combat action error:', err);
    res.status(500).json({ message: 'Server error executing combat action' });
  }
});

// ─── Explore Location ─────────────────────────────────────
router.post('/explore', verifyToken, async (req, res) => {
  try {
    const { location } = req.body;
    const player = await Player.findById(req.user.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });

    // Simple exploration perception check
    const roll = Math.floor(Math.random() * 20) + 1;
    const success = roll >= 12;

    let found = false;
    let narrative = 'คุณค้นหาพื้นที่อย่างระมัดระวังแต่ไม่พบสิ่งผิดปกติเพิ่ม';
    let newClue = null;

    if (success) {
      // Find a clue the player hasn't collected yet
      const collected = player.narrativeState.evidenceBoard?.collected || [];
      const uncollectedClue = await Evidence.findOne({
        clueId: { $nin: collected }
      });

      if (uncollectedClue) {
        player.narrativeState.evidenceBoard.collected.push(uncollectedClue.clueId);
        const { updateKnowledgeStateFromEvidence } = require('../engine/revealControl');
        updateKnowledgeStateFromEvidence(uncollectedClue.clueId, player);
        player.narrativeState.evidenceBoard.completionPercent = Math.round(
          (player.narrativeState.evidenceBoard.collected.length / 12) * 100
        );
        player.markModified('narrativeState');
        await player.save();

        found = true;
        newClue = uncollectedClue;
        narrative = `⭐ คุณค้นพบเบาะแสใหม่: ${uncollectedClue.title}!`;
      }
    }

    res.json({
      found,
      narrative,
      evidence: newClue,
      player: formatPlayer(player)
    });
  } catch (err) {
    console.error('Explore error:', err);
    res.status(500).json({ message: 'Server error during exploration' });
  }
});

module.exports = router;
