/**
 * dice.js — Server-side D20 dice engine
 * All dice rolls MUST happen here, never on the client.
 */

/**
 * Roll a single d20.
 * @returns {number} 1–20
 */
const rollD20 = () => Math.floor(Math.random() * 20) + 1;

/**
 * Roll a die with the given number of sides.
 * @param {number} sides
 * @returns {number} 1–sides
 */
const roll = (sides) => Math.floor(Math.random() * sides) + 1;

/**
 * Roll a d20 with optional advantage/disadvantage and a modifier.
 * @param {number} modifier
 * @param {boolean} advantage  — roll twice, take higher
 * @param {boolean} disadvantage — roll twice, take lower
 * @returns {{ raw: number, modifier: number, total: number, isCrit: boolean, isCritFail: boolean }}
 */
const rollWithModifier = (modifier = 0, advantage = false, disadvantage = false) => {
  let raw;

  if (advantage && !disadvantage) {
    const r1 = rollD20();
    const r2 = rollD20();
    raw = Math.max(r1, r2);
  } else if (disadvantage && !advantage) {
    const r1 = rollD20();
    const r2 = rollD20();
    raw = Math.min(r1, r2);
  } else {
    raw = rollD20();
  }

  const total = raw + modifier;
  const isCrit = raw === 20;
  const isCritFail = raw === 1;

  return { raw, modifier, total, isCrit, isCritFail };
};

/**
 * Parse and roll a dice notation string, e.g. '2d6+3', '1d8', '2d4-1'.
 * @param {string} diceNotation  — e.g. '2d6+3'
 * @param {number} extraModifier — additional modifier to add
 * @returns {{ rolls: number[], modifier: number, total: number, notation: string }}
 */
const rollDamage = (diceNotation = '1d6', extraModifier = 0) => {
  // Match patterns like 2d6+3, 1d8-1, 3d4
  const match = diceNotation.match(/^(\d+)d(\d+)([+-]\d+)?$/i);

  if (!match) {
    // Fallback: treat as flat value
    const flat = parseInt(diceNotation, 10) || 0;
    return { rolls: [flat], modifier: extraModifier, total: flat + extraModifier, notation: diceNotation };
  }

  const numDice = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const notationMod = match[3] ? parseInt(match[3], 10) : 0;
  const totalMod = notationMod + extraModifier;

  const rolls = [];
  for (let i = 0; i < numDice; i++) {
    rolls.push(roll(sides));
  }

  const total = rolls.reduce((acc, v) => acc + v, 0) + totalMod;

  return { rolls, modifier: totalMod, total: Math.max(0, total), notation: diceNotation };
};

/**
 * Roll double the dice (crit) for the given notation.
 * @param {string} diceNotation
 * @param {number} extraModifier
 * @returns {{ rolls: number[], modifier: number, total: number, notation: string, crit: true }}
 */
const rollCritDamage = (diceNotation = '1d6', extraModifier = 0) => {
  const match = diceNotation.match(/^(\d+)d(\d+)([+-]\d+)?$/i);

  if (!match) {
    const flat = parseInt(diceNotation, 10) || 0;
    return { rolls: [flat, flat], modifier: extraModifier, total: flat * 2 + extraModifier, notation: diceNotation, crit: true };
  }

  // Double the number of dice
  const numDice = parseInt(match[1], 10) * 2;
  const sides = parseInt(match[2], 10);
  const notationMod = match[3] ? parseInt(match[3], 10) : 0;
  const totalMod = notationMod + extraModifier;

  const rolls = [];
  for (let i = 0; i < numDice; i++) {
    rolls.push(roll(sides));
  }

  const total = rolls.reduce((acc, v) => acc + v, 0) + totalMod;

  return { rolls, modifier: totalMod, total: Math.max(0, total), notation: diceNotation, crit: true };
};

/**
 * Determine the outcome category of a roll vs a DC.
 * @param {{ raw: number, total: number, isCrit: boolean, isCritFail: boolean }} rollResult
 * @param {number} dc
 * @returns {'critSuccess'|'success'|'partialSuccess'|'failure'|'critFail'}
 */
const getOutcome = (rollResult, dc) => {
  const { raw, total, isCrit, isCritFail } = rollResult;

  if (isCrit) return 'critSuccess';
  if (isCritFail) return 'critFail';
  if (total >= dc + 5) return 'critSuccess';
  if (total >= dc) return 'success';
  if (total >= dc - 4) return 'partialSuccess';
  return 'failure';
};

/**
 * Get a short Thai narrative string for a dice outcome.
 * @param {'critSuccess'|'success'|'partialSuccess'|'failure'|'critFail'} outcome
 * @returns {string}
 */
const getNarrativeResult = (outcome) => {
  const narratives = {
    critSuccess: 'สำเร็จอย่างยอดเยี่ยม! การกระทำของคุณเกินความคาดหมาย',
    success: 'สำเร็จ! คุณทำได้ตามที่ตั้งใจไว้',
    partialSuccess: 'สำเร็จบางส่วน... ผลลัพธ์ไม่สมบูรณ์แบบนัก',
    failure: 'ล้มเหลว ความพยายามครั้งนี้ไม่เป็นผล',
    critFail: 'หายนะ! สิ่งที่เลวร้ายที่สุดเกิดขึ้น สถานการณ์แย่ลงอย่างร้ายแรง'
  };
  return narratives[outcome] || 'ผลลัพธ์ไม่ชัดเจน...';
};

/**
 * Calculate ability modifier from a stat score (D&D 5e style).
 * @param {number} score
 * @returns {number}
 */
const getModifier = (score) => Math.floor((score - 10) / 2);

module.exports = {
  rollD20,
  roll,
  rollWithModifier,
  rollDamage,
  rollCritDamage,
  getOutcome,
  getNarrativeResult,
  getModifier
};
