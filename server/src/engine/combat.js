/**
 * combat.js — Combat resolver engine
 * Handles attack resolution, initiative, enemy counter-attacks, death saves,
 * and enemy definitions per location.
 */

const { rollWithModifier, rollDamage, rollCritDamage, getModifier } = require('./dice');
const enemies = require('../data/enemies');

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Apply damage to an entity — suit integrity absorbs damage first.
 * @param {number} currentSI
 * @param {number} maxSI
 * @param {number} currentHP
 * @param {number} damage
 * @returns {{ newSI: number, newHP: number, overflow: number }}
 */
const applyDamage = (currentSI, maxSI, currentHP, damage) => {
  let newSI = currentSI;
  let newHP = currentHP;
  let overflow = 0;

  if (newSI > 0) {
    if (damage <= newSI) {
      newSI -= damage;
    } else {
      overflow = damage - newSI;
      newSI = 0;
      newHP = Math.max(0, newHP - overflow);
    }
  } else {
    newHP = Math.max(0, newHP - damage);
  }

  return { newSI, newHP, overflow };
};

// ─── resolveAttack ────────────────────────────────────────────────────────────

/**
 * Resolve a player's attack against an enemy.
 * @param {Object} player  — Mongoose player document (or plain object)
 * @param {Object} weapon  — { damage: '1d8+3', name: string }
 * @param {Object} enemy   — { name, ac, hp: { current, max }, suitIntegrity: { current, max } }
 * @returns {{ hit: boolean, damage: number, newEnemyHp: number, newEnemySI: number, narrative: string, isCrit: boolean }}
 */
const resolveAttack = (player, weapon, enemy) => {
  const stats = player.character?.stats || {};
  // Use higher of STR or DEX for attack modifier (finesse-style)
  const strMod = getModifier(stats.str || 10);
  const dexMod = getModifier(stats.dex || 10);
  const attackMod = Math.max(strMod, dexMod);

  const rollResult = rollWithModifier(attackMod);
  const { total, isCrit, isCritFail } = rollResult;

  const enemyAC = enemy.ac || 10;
  const enemyCurrentSI = enemy.suitIntegrity?.current ?? 0;
  const enemyMaxSI = enemy.suitIntegrity?.max ?? 0;
  const enemyCurrentHP = enemy.hp?.current ?? enemy.hp ?? 0;

  if (isCritFail) {
    return {
      hit: false,
      damage: 0,
      newEnemyHp: enemyCurrentHP,
      newEnemySI: enemyCurrentSI,
      narrative: `คุณพลาดการโจมตีอย่างน่าอับอาย! ปืนของคุณเกือบหลุดมือ`,
      isCrit: false,
      rollResult
    };
  }

  const hit = isCrit || total >= enemyAC;

  if (!hit) {
    return {
      hit: false,
      damage: 0,
      newEnemyHp: enemyCurrentHP,
      newEnemySI: enemyCurrentSI,
      narrative: `การโจมตีพลาด! กระสุนผ่านไปโดน${enemy.name} (ทอยได้ ${total} vs AC ${enemyAC})`,
      isCrit: false,
      rollResult
    };
  }

  // Roll damage — crit doubles dice
  const dmgNotation = weapon?.damage || '1d6';
  const dmgRoll = isCrit
    ? rollCritDamage(dmgNotation, attackMod)
    : rollDamage(dmgNotation, attackMod);

  const { newSI: newEnemySI, newHP: newEnemyHp } = applyDamage(
    enemyCurrentSI,
    enemyMaxSI,
    enemyCurrentHP,
    dmgRoll.total
  );

  const siText = enemyCurrentSI > 0
    ? ` (ชุดป้องกันของ${enemy.name}รับดาเมจ ${Math.min(dmgRoll.total, enemyCurrentSI)} หน่วย)`
    : '';

  const critText = isCrit ? '⚡ คริติคอล! ' : '';
  const narrative = `${critText}คุณยิง${enemy.name} โดน ${dmgRoll.total} ดาเมจ!${siText} (ทอยได้ ${total})`;

  return {
    hit: true,
    damage: dmgRoll.total,
    newEnemyHp,
    newEnemySI,
    narrative,
    isCrit,
    rollResult,
    dmgRoll
  };
};

// ─── resolveEnemyAttack ───────────────────────────────────────────────────────

/**
 * Resolve an enemy's attack against the player.
 * @param {Object} enemy  — enemy definition with attacks array
 * @param {Object} player — player document
 * @returns {{ hit: boolean, damage: number, newPlayerHp: number, newSI: number, narrative: string }}
 */
const resolveEnemyAttack = (enemy, player) => {
  const playerAC = 10 + getModifier(player.character?.stats?.dex || 10);
  const attack = enemy.attacks?.[Math.floor(Math.random() * (enemy.attacks?.length || 1))] || { name: 'โจมตี', damage: '1d6' };

  const rollResult = rollWithModifier(2); // enemy attack modifier +2 base
  const { total, isCrit, isCritFail } = rollResult;

  const playerCurrentSI = player.character?.suitIntegrity?.current ?? 0;
  const playerMaxSI = player.character?.suitIntegrity?.max ?? 0;
  const playerCurrentHP = player.character?.hp?.current ?? 50;

  if (isCritFail) {
    return {
      hit: false,
      damage: 0,
      newPlayerHp: playerCurrentHP,
      newSI: playerCurrentSI,
      narrative: `${enemy.name} พลาดการโจมตี — กระสุนพุ่งผ่านคุณไปอย่างหวุดหวิด`
    };
  }

  const hit = isCrit || total >= playerAC;

  if (!hit) {
    return {
      hit: false,
      damage: 0,
      newPlayerHp: playerCurrentHP,
      newSI: playerCurrentSI,
      narrative: `${enemy.name} ใช้${attack.name} แต่พลาด (ทอยได้ ${total} vs AC ${playerAC})`
    };
  }

  const dmgRoll = isCrit
    ? rollCritDamage(attack.damage, 0)
    : rollDamage(attack.damage, 0);

  const { newSI: newPlayerSI, newHP: newPlayerHp } = applyDamage(
    playerCurrentSI,
    playerMaxSI,
    playerCurrentHP,
    dmgRoll.total
  );

  const critText = isCrit ? '⚡ คริติคอล! ' : '';
  const siText = playerCurrentSI > 0
    ? ` ชุดอวกาศของคุณรับแรงกระแทก (SI เหลือ ${newPlayerSI})`
    : '';
  const narrative = `${critText}${enemy.name} ใช้${attack.name} โจมตีคุณ ${dmgRoll.total} ดาเมจ!${siText}`;

  return {
    hit: true,
    damage: dmgRoll.total,
    newPlayerHp,
    newSI: newPlayerSI,
    narrative,
    isCrit,
    rollResult,
    dmgRoll
  };
};

// ─── rollInitiative ───────────────────────────────────────────────────────────

/**
 * Roll initiative for the player and all enemies, return sorted order.
 * @param {number} playerDex
 * @param {Array} enemyList — array of enemy objects
 * @returns {Array} sorted initiative order [{ id, name, initiative, isPlayer }]
 */
const rollInitiative = (playerDex, enemyList = []) => {
  const dexMod = getModifier(playerDex || 10);
  const playerInit = rollWithModifier(dexMod).total;

  const order = [
    { id: 'player', name: 'ผู้เล่น', initiative: playerInit, isPlayer: true }
  ];

  enemyList.forEach((enemy, idx) => {
    const enemyInit = rollWithModifier(1).total; // enemies get +1
    order.push({
      id: enemy.enemyId || `enemy_${idx}`,
      name: enemy.name,
      initiative: enemyInit,
      isPlayer: false,
      enemy
    });
  });

  // Sort descending (higher initiative goes first)
  order.sort((a, b) => b.initiative - a.initiative);

  return order;
};

// ─── checkDeathSaves ──────────────────────────────────────────────────────────

/**
 * Roll a death saving throw for the player.
 * 10+ = success, 1–9 = failure, nat 20 = regain 1 HP, nat 1 = two failures
 * @param {Object} player — must have deathSaveSuccesses and deathSaveFailures
 * @returns {{ stable: boolean, dead: boolean, roll: number, narrative: string }}
 */
const checkDeathSaves = (player) => {
  const rawRoll = rollWithModifier(0);
  const { raw } = rawRoll;

  let successes = player.deathSaveSuccesses || 0;
  let failures = player.deathSaveFailures || 0;

  let stable = false;
  let dead = false;
  let narrative = '';

  if (raw === 20) {
    // Miraculous recovery
    stable = true;
    narrative = `⭐ ปาฏิหาริย์! คุณทอย 20 — ฟื้นคืนสติด้วย HP 1 หน่วย`;
    return { stable, dead, roll: raw, narrative, regainHP: 1 };
  }

  if (raw === 1) {
    failures += 2;
    narrative = `💀 หายนะ! คุณทอยได้ 1 — นับเป็นการล้มเหลว 2 ครั้ง`;
  } else if (raw >= 10) {
    successes += 1;
    narrative = `✅ Death Save สำเร็จ (${successes}/3) — ทอยได้ ${raw}`;
  } else {
    failures += 1;
    narrative = `❌ Death Save ล้มเหลว (${failures}/3) — ทอยได้ ${raw}`;
  }

  if (successes >= 3) {
    stable = true;
    narrative += ' — คุณมีเสถียรภาพแล้ว!';
  }

  if (failures >= 3) {
    dead = true;
    narrative += ' — คุณสิ้นชีพแล้ว...';
  }

  return {
    stable,
    dead,
    roll: raw,
    narrative,
    successes,
    failures
  };
};

// ─── getEnemiesByLocation ─────────────────────────────────────────────────────

/**
 * Get enemy definitions available at a given location.
 * @param {string} location
 * @returns {Array} enemy objects for that zone
 */
const getEnemiesByLocation = (location) => {
  return enemies.filter(e =>
    e.location && e.location.includes(location)
  );
};

module.exports = {
  resolveAttack,
  resolveEnemyAttack,
  rollInitiative,
  checkDeathSaves,
  getEnemiesByLocation,
  applyDamage
};
