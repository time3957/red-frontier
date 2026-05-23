const express = require('express');
const Player = require('../models/Player');
const Evidence = require('../models/Evidence');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Helper to determine unlocked layers based on clue count
function getUnlockedLayers(collectedCount) {
  const layers = [];
  if (collectedCount >= 2) {
    layers.push('PROJECT AZRAEL: เปิดเผยว่า Prometheus กำลังทำโครงการลับบางอย่างเกี่ยวกับสิ่งมีชีวิตดัดแปลง');
  }
  if (collectedCount >= 5) {
    layers.push('ARESIUM PROPERTIES: ค้นพบว่าแร่สีแดง Aresium มีคุณสมบัติในการเร่งการกลายพันธุ์และเชื่อมโยงประสาท');
  }
  if (collectedCount >= 8) {
    layers.push('RELAY-7 SIGNAL: สัญญาณจากดวงจันทร์โฟบอสไม่ใช่การทำงานผิดพลาด แต่เป็นการจงใจส่งข้อความหาใครบางคน');
  }
  if (collectedCount >= 11) {
    layers.push('MARS CONSPIRACY: การสมรู้ร่วมคิดระหว่างระดับสูงของ ISU และ Prometheus เพื่อทดลองกับผู้ใช้แรงงาน');
  }
  return layers;
}

// ─── Get Evidence Board ──────────────────────────────────
router.get('/board', verifyToken, async (req, res) => {
  try {
    const player = await Player.findById(req.user.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const collected = player.narrativeState?.evidenceBoard?.collected || [];
    
    // Fetch all clues from DB
    const allClues = await Evidence.find({});
    
    // Map found status based on player collected clues
    const board = allClues.map(clue => {
      const clueObj = clue.toObject();
      clueObj.found = collected.includes(clue.clueId);
      return clueObj;
    });

    // Determine connection threads
    const connections = [];
    const collectedSet = new Set(collected);
    allClues.forEach(clue => {
      if (collectedSet.has(clue.clueId)) {
        clue.connectsTo?.forEach(targetId => {
          if (collectedSet.has(targetId)) {
            // Sort to avoid duplicate lines in client
            const pair = [clue.clueId, targetId].sort();
            if (!connections.some(c => c[0] === pair[0] && c[1] === pair[1])) {
              connections.push(pair);
            }
          }
        });
      }
    });

    const completionPercent = Math.round((collected.length / 12) * 100);
    const narrativeLayers = getUnlockedLayers(collected.length);

    res.json({
      collected,
      total: 12,
      connections,
      completionPercent,
      narrativeLayers,
      board
    });
  } catch (err) {
    console.error('Get evidence board error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Alias GET / to GET /board for convenience
router.get('/', verifyToken, async (req, res) => {
  res.redirect('/api/evidence/board');
});

// ─── Collect Clue ────────────────────────────────────────
router.post('/collect/:clueId', verifyToken, async (req, res) => {
  try {
    const { clueId } = req.params;
    const player = await Player.findById(req.user.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Verify clue exists in database
    const clueExists = await Evidence.findOne({ clueId });
    if (!clueExists) {
      return res.status(404).json({ message: 'Clue not found in system database' });
    }

    if (!player.narrativeState.evidenceBoard) {
      player.narrativeState.evidenceBoard = { collected: [], completionPercent: 0 };
    }

    let collected = player.narrativeState.evidenceBoard.collected || [];
    let isNew = false;
    if (!collected.includes(clueId)) {
      player.narrativeState.evidenceBoard.collected.push(clueId);
      const { updateKnowledgeStateFromEvidence } = require('../engine/revealControl');
      updateKnowledgeStateFromEvidence(clueId, player);
      isNew = true;
    }

    player.narrativeState.evidenceBoard.completionPercent = Math.round(
      (player.narrativeState.evidenceBoard.collected.length / 12) * 100
    );

    player.markModified('narrativeState');
    await player.save();

    res.json({
      success: true,
      isNew,
      collected: player.narrativeState.evidenceBoard.collected,
      completionPercent: player.narrativeState.evidenceBoard.completionPercent
    });
  } catch (err) {
    console.error('Collect clue error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
