const express = require('express');
const Player = require('../models/Player');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Helper to format player response to match frontend expectations
function formatPlayer(player) {
  const char = player.character || {};
  return {
    id: player._id,
    username: player.username,
    email: player.email,
    name: char.name || '',
    class: char.class || '',
    level: char.level || 1,
    xp: char.xp || 0,
    credits: player.credits || 0,
    hp: {
      current: char.hp?.current || 50,
      max: char.hp?.max || 50
    },
    si: {
      current: char.suitIntegrity?.current || 30,
      max: char.suitIntegrity?.max || 30
    },
    o2: {
      current: char.o2 !== undefined ? char.o2 : 100,
      max: 100
    },
    pc: {
      // Map powerCell (0-100) to pc dots (1-5)
      current: char.powerCell !== undefined ? Math.max(1, Math.min(5, Math.ceil(char.powerCell / 20))) : 3,
      max: 5
    },
    radiation: char.radiationPoints || 0,
    sanity: {
      current: char.sanity !== undefined ? char.sanity : 80,
      max: 100
    },
    humanityIndex: char.humanityIndex !== undefined ? char.humanityIndex : 100,
    stats: {
      str: char.stats?.str || 10,
      dex: char.stats?.dex || 10,
      con: char.stats?.con || 10,
      int: char.stats?.int || 10,
      wis: char.stats?.wis || 10,
      cha: char.stats?.cha || 10
    },
    inventory: player.inventory || [],
    statusEffects: []
  };
}

// ─── Get Character State ──────────────────────────────────
router.get('/state', verifyToken, async (req, res) => {
  try {
    const player = await Player.findById(req.user.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    if (!player.character || !player.character.name) {
      return res.status(404).json({ message: 'Character not created yet' });
    }

    res.json(formatPlayer(player));
  } catch (err) {
    console.error('Get character state error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Create Character ─────────────────────────────────────
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { name, class: charClass } = req.body;

    if (!name || !charClass) {
      return res.status(400).json({ message: 'Name and class are required' });
    }

    const player = await Player.findById(req.user.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Set class defaults
    let stats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    let hpMax = 50;
    let siMax = 30;
    let powerCell = 80;
    let humanityIndex = 100;
    let startNodeId = 'NODE_CLASS_SELECT';

    switch (charClass.toLowerCase()) {
      case 'ranger':
        stats = { str: 12, dex: 16, con: 12, int: 10, wis: 10, cha: 8 };
        hpMax = 55;
        siMax = 30;
        powerCell = 60;
        startNodeId = 'NODE_RANGER_START';
        break;
      case 'scientist':
        stats = { str: 8, dex: 10, con: 10, int: 18, wis: 14, cha: 10 };
        hpMax = 42;
        siMax = 25;
        powerCell = 80;
        startNodeId = 'NODE_SCIENTIST_START';
        break;
      case 'engineer':
        stats = { str: 14, dex: 12, con: 12, int: 16, wis: 10, cha: 8 };
        hpMax = 52;
        siMax = 35;
        powerCell = 80;
        startNodeId = 'NODE_ENGINEER_START';
        break;
      case 'medic':
        stats = { str: 10, dex: 12, con: 13, int: 14, wis: 16, cha: 12 };
        hpMax = 46;
        siMax = 25;
        powerCell = 60;
        startNodeId = 'NODE_MEDIC_START';
        break;
      case 'augmented':
        stats = { str: 12, dex: 14, con: 10, int: 14, wis: 10, cha: 6 };
        hpMax = 48;
        siMax = 30;
        powerCell = 80;
        humanityIndex = 80;
        startNodeId = 'NODE_AUGMENTED_START';
        break;
      default:
        return res.status(400).json({ message: 'Invalid character class' });
    }

    // Set character properties
    player.character = {
      name,
      class: charClass.toLowerCase(),
      stats,
      hp: { current: hpMax, max: hpMax },
      suitIntegrity: { current: siMax, max: siMax },
      o2: 100,
      powerCell,
      radiationPoints: 0,
      humanityIndex,
      sanity: 80,
      level: 1,
      xp: 0
    };

    player.credits = 200;
    player.narrativeState = {
      currentNodeId: startNodeId,
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
      visitedNodes: [startNodeId],
      completedQuests: []
    };

    await player.save();

    res.json(formatPlayer(player));
  } catch (err) {
    console.error('Create character error:', err);
    res.status(500).json({ message: 'Server error creating character' });
  }
});

// ─── Rest Character ───────────────────────────────────────
router.post('/rest', verifyToken, async (req, res) => {
  try {
    const player = await Player.findById(req.user.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    if (!player.character || !player.character.name) {
      return res.status(400).json({ message: 'Character not created yet' });
    }

    // Recover resources during short rest
    const maxHp = player.character.hp.max;
    // Restore 50% HP or fully restore
    player.character.hp.current = Math.min(maxHp, player.character.hp.current + Math.floor(maxHp * 0.5));
    // Restore SI to full
    player.character.suitIntegrity.current = player.character.suitIntegrity.max;
    // Recharge O2 to 100
    player.character.o2 = 100;
    // Recharge Sanity slightly (+10)
    player.character.sanity = Math.min(100, player.character.sanity + 10);

    await player.save();

    res.json(formatPlayer(player));
  } catch (err) {
    console.error('Rest character error:', err);
    res.status(500).json({ message: 'Server error resting character' });
  }
});

module.exports = router;
module.exports.formatPlayer = formatPlayer; // Export formatting helper for other routes
