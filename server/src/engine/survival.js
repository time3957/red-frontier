/**
 * survival.js — Survival resource manager
 * Tracks O2, radiation, thermal, sanity, suit integrity, and survival status.
 */

// ─── Location metadata ────────────────────────────────────────────────────────

const LOCATION_DATA = {
  // outside / exposed locations — heavy resource drain
  sector_7_exterior: { isOutside: true, radiation: 2, thermal: true },
  hephaestus_7: { isOutside: true, radiation: 3, thermal: true },
  prometheus_mining: { isOutside: false, radiation: 1, thermal: false },
  // inside / safe locations
  ares_base_i: { isOutside: false, radiation: 0, thermal: false, isSafe: true },
  forgotten_warrens: { isOutside: false, radiation: 1, thermal: false },
  maintenance_tunnel: { isOutside: false, radiation: 0, thermal: false, isSafe: true },
  med_bay: { isOutside: false, radiation: 0, thermal: false, isSafe: true }
};

const getLocationData = (location) =>
  LOCATION_DATA[location] || { isOutside: false, radiation: 0, thermal: false };

// ─── tickO2 ───────────────────────────────────────────────────────────────────

/**
 * Tick O2 resource for one game turn.
 * Outside dome: -3/turn, inside: -0.5/turn (cybernetic recycler reduces by 1 extra)
 * @param {Object} player
 * @param {string} location
 * @param {boolean} hasCybernetics — has O2 recycler cybernetic
 * @returns {{ newO2: number, alert: boolean, critical: boolean, deathSave: boolean, narrative: string }}
 */
const tickO2 = (player, location, hasCybernetics = false) => {
  const locData = getLocationData(location);
  const currentO2 = player.character?.o2 ?? 100;

  let drain = locData.isOutside ? 3 : 0.5;
  if (hasCybernetics) drain = Math.max(0, drain - 1);

  const newO2 = Math.max(0, currentO2 - drain);

  let alert = false;
  let critical = false;
  let deathSave = false;
  let narrative = '';

  if (newO2 === 0) {
    deathSave = true;
    critical = true;
    alert = true;
    narrative = '☠️ ออกซิเจนหมดแล้ว! คุณกำลังหมดสติ — Death Save!';
  } else if (newO2 <= 10) {
    critical = true;
    alert = true;
    narrative = `⚠️ วิกฤต! ออกซิเจนเหลือ ${newO2.toFixed(0)}% — คุณหายใจไม่ออก!`;
  } else if (newO2 <= 20) {
    alert = true;
    narrative = `⚠️ ออกซิเจนต่ำ! เหลือ ${newO2.toFixed(0)}% — รีบหาทางออก!`;
  } else {
    narrative = locData.isOutside
      ? `ออกซิเจนเหลือ ${newO2.toFixed(0)}% (นอกฐาน ใช้เร็ว)`
      : `ออกซิเจนเหลือ ${newO2.toFixed(0)}%`;
  }

  return { newO2, alert, critical, deathSave, narrative };
};

// ─── tickRadiation ────────────────────────────────────────────────────────────

/**
 * Tick radiation exposure for one game turn.
 * @param {Object} player
 * @param {string} location
 * @returns {{ newRadPoints: number, narrative: string, threshold: string|null }}
 */
const tickRadiation = (player, location) => {
  const locData = getLocationData(location);
  const currentRad = player.character?.radiationPoints ?? 0;
  const gain = locData.radiation || 0;

  const newRadPoints = Math.min(100, currentRad + gain);

  let threshold = null;
  let narrative = '';

  if (newRadPoints >= 80) {
    threshold = 'lethal';
    narrative = '☢️ รังสีในระดับอันตรายถึงชีวิต! ร่างกายของคุณกำลังพังทลาย';
  } else if (newRadPoints >= 60) {
    threshold = 'severe';
    narrative = `☢️ รังสีสะสมสูง (${newRadPoints} หน่วย) — สถิติลดลง`;
  } else if (newRadPoints >= 40) {
    threshold = 'moderate';
    narrative = `☢️ รังสีปานกลาง (${newRadPoints} หน่วย) — เฝ้าระวัง`;
  } else if (gain > 0) {
    narrative = `☢️ รังสีสะสม ${newRadPoints} หน่วย`;
  }

  return { newRadPoints, narrative, threshold };
};

// ─── tickThermal ──────────────────────────────────────────────────────────────

/**
 * Tick thermal exposure — extreme cold on Mars exterior.
 * @param {Object} player
 * @param {string} location
 * @returns {{ hypothermiaStacks: number, narrative: string }}
 */
const tickThermal = (player, location) => {
  const locData = getLocationData(location);
  const currentStacks = player.thermalStacks || 0;

  if (!locData.thermal) {
    // Inside — recover one stack if any
    const hypothermiaStacks = Math.max(0, currentStacks - 1);
    const narrative = currentStacks > 0
      ? `🌡️ อุณหภูมิปกติ — ร่างกายฟื้นตัวจากความหนาว (สแตก ${hypothermiaStacks})`
      : '';
    return { hypothermiaStacks, narrative };
  }

  const hypothermiaStacks = Math.min(5, currentStacks + 1);
  let narrative = '';

  if (hypothermiaStacks >= 4) {
    narrative = `🥶 วิกฤตอุณหภูมิ! ร่างกายแข็งทื่อ — ความเร็วและความแม่นยำลดลงอย่างมาก`;
  } else if (hypothermiaStacks >= 2) {
    narrative = `🥶 อุณหภูมิภายนอกต่ำกว่า -60°C — ร่างกายเริ่มชาเย็น (สแตก ${hypothermiaStacks})`;
  } else {
    narrative = `🥶 พื้นผิวดาวอังคารเยือกแข็ง — สแต็กความหนาว +1`;
  }

  return { hypothermiaStacks, narrative };
};

// ─── tickSanity ───────────────────────────────────────────────────────────────

/**
 * Tick sanity — influenced by isolation, companions, and traumatic events.
 * @param {Object} player
 * @param {string[]} companions  — list of companion IDs present
 * @param {string[]} events      — event tags, e.g. ['witnessed_death', 'alien_encounter']
 * @returns {{ newSanity: number, narrative: string, threshold: string|null }}
 */
const tickSanity = (player, companions = [], events = []) => {
  const currentSanity = player.character?.sanity ?? 100;
  let delta = 0;

  // Companions restore sanity
  if (companions.length > 0) {
    delta += companions.length * 0.5;
  }

  // Events affect sanity
  const sanityEvents = {
    witnessed_death: -5,
    ally_death: -10,
    alien_encounter: -8,
    relay_contact: -3,
    radiation_sickness: -2,
    suit_breach: -4,
    successful_mission: +3,
    rest: +2,
    nightmare: -6
  };

  events.forEach(event => {
    delta += sanityEvents[event] || 0;
  });

  // Natural tick — isolation drain
  if (companions.length === 0) {
    delta -= 0.2;
  }

  const newSanity = Math.max(0, Math.min(100, currentSanity + delta));

  let threshold = null;
  let narrative = '';

  if (newSanity <= 10) {
    threshold = 'psychosis';
    narrative = '🧠 จิตใจแตกสลาย... คุณไม่สามารถแยกแยะความจริงจากภาพหลอน';
  } else if (newSanity <= 25) {
    threshold = 'severe';
    narrative = `🧠 สติสัมปชัญญะกำลังพังทลาย (${newSanity.toFixed(0)}) — ความเครียดรุนแรง`;
  } else if (newSanity <= 50) {
    threshold = 'stressed';
    narrative = `🧠 ความเครียดสะสม (สติ ${newSanity.toFixed(0)}) — ต้องการการพักผ่อน`;
  } else if (delta < 0) {
    narrative = `🧠 สติเหลือ ${newSanity.toFixed(0)}`;
  }

  return { newSanity, narrative, threshold };
};

// ─── applyDamageToSuit ────────────────────────────────────────────────────────

/**
 * Apply damage to the suit — SI absorbs first, then HP.
 * Decompression triggers if SI reaches 0 from external damage.
 * @param {Object} player
 * @param {number} damage
 * @returns {{ newSI: number, newHP: number, decompression: boolean, narrative: string }}
 */
const applyDamageToSuit = (player, damage) => {
  const currentSI = player.character?.suitIntegrity?.current ?? 0;
  const maxSI = player.character?.suitIntegrity?.max ?? 30;
  const currentHP = player.character?.hp?.current ?? 50;

  let newSI = currentSI;
  let newHP = currentHP;
  let decompression = false;

  if (newSI > 0) {
    if (damage >= newSI) {
      const overflow = damage - newSI;
      newSI = 0;
      newHP = Math.max(0, newHP - overflow);
      decompression = true;
    } else {
      newSI -= damage;
    }
  } else {
    newHP = Math.max(0, newHP - damage);
  }

  let narrative = '';

  if (decompression) {
    narrative = `💨 ชุดอวกาศเสียหายหนัก! การลดความดันฉุกเฉิน — ออกซิเจนรั่วออกอย่างรวดเร็ว!`;
  } else if (newSI < maxSI * 0.3) {
    narrative = `⚠️ ชุดอวกาศเสียหายหนัก (SI: ${newSI}/${maxSI}) — อันตรายมาก`;
  } else {
    narrative = `ชุดอวกาศรับดาเมจ ${damage} หน่วย (SI: ${newSI}/${maxSI})`;
  }

  return { newSI, newHP, decompression, narrative };
};

// ─── rechargeSI ───────────────────────────────────────────────────────────────

/**
 * Recharge suit integrity to full (triggered after 2 turns not hit).
 * @param {Object} player
 * @returns {{ newSI: number, narrative: string }}
 */
const rechargeSI = (player) => {
  const maxSI = player.character?.suitIntegrity?.max ?? 30;
  return {
    newSI: maxSI,
    narrative: `🔋 ระบบชุดอวกาศชาร์จใหม่เต็ม (SI: ${maxSI}/${maxSI})`
  };
};

// ─── getSurvivalStatus ────────────────────────────────────────────────────────

/**
 * Get a summary of all survival warnings and critical states.
 * @param {Object} player
 * @returns {{ warnings: string[], critical: string[] }}
 */
const getSurvivalStatus = (player) => {
  const warnings = [];
  const critical = [];

  const char = player.character || {};
  const o2 = char.o2 ?? 100;
  const rad = char.radiationPoints ?? 0;
  const hp = char.hp?.current ?? 50;
  const maxHp = char.hp?.max ?? 50;
  const si = char.suitIntegrity?.current ?? 30;
  const maxSI = char.suitIntegrity?.max ?? 30;
  const sanity = char.sanity ?? 100;

  // O2 checks
  if (o2 === 0) critical.push('☠️ ออกซิเจนหมด — กำลังสิ้นสติ!');
  else if (o2 <= 10) critical.push(`⚠️ ออกซิเจนวิกฤต: ${o2}%`);
  else if (o2 <= 20) warnings.push(`⚠️ ออกซิเจนต่ำ: ${o2}%`);

  // HP checks
  if (hp === 0) critical.push('💀 HP หมด — กำลังตาย!');
  else if (hp <= maxHp * 0.15) critical.push(`⚠️ HP วิกฤต: ${hp}/${maxHp}`);
  else if (hp <= maxHp * 0.3) warnings.push(`⚠️ HP ต่ำ: ${hp}/${maxHp}`);

  // SI checks
  if (si === 0) critical.push('💨 ชุดอวกาศพัง — ไม่มีการป้องกัน!');
  else if (si <= maxSI * 0.2) warnings.push(`⚠️ SI ต่ำ: ${si}/${maxSI}`);

  // Radiation checks
  if (rad >= 80) critical.push(`☢️ รังสีอันตรายถึงชีวิต: ${rad} หน่วย`);
  else if (rad >= 60) critical.push(`☢️ รังสีสูงมาก: ${rad} หน่วย`);
  else if (rad >= 40) warnings.push(`☢️ รังสีสะสม: ${rad} หน่วย`);

  // Sanity checks
  if (sanity <= 10) critical.push(`🧠 จิตใจแตกสลาย: ${sanity}`);
  else if (sanity <= 25) critical.push(`🧠 สติอ่อนแอมาก: ${sanity}`);
  else if (sanity <= 50) warnings.push(`🧠 ความเครียดสูง: สติ ${sanity}`);

  return { warnings, critical };
};

module.exports = {
  tickO2,
  tickRadiation,
  tickThermal,
  tickSanity,
  applyDamageToSuit,
  rechargeSI,
  getSurvivalStatus
};
