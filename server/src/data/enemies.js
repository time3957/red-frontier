/**
 * enemies.js — Enemy definitions for Red Frontier
 * Each enemy has stats, attacks, XP reward, and location tags.
 */

const enemies = [
  {
    enemyId: 'prometheus_guard',
    name: 'Prometheus Security Guard',
    hp: 30,
    ac: 14,
    si: 20,
    attacks: [
      { name: 'Rifle Shot', damage: '1d8+3', range: 'ranged' }
    ],
    xpReward: 100,
    lootTable: ['med_kit_small', 'ammo_rifle_x10'],
    location: ['prometheus_mining', 'ares_base_i'],
    description: 'ทหารรักษาความปลอดภัยมาตรฐานของ Prometheus Corp ติดอาวุธครบครัน'
  },
  {
    enemyId: 'prometheus_elite',
    name: 'Prometheus Elite Operator',
    hp: 50,
    ac: 16,
    si: 30,
    attacks: [
      { name: 'AR-75 Burst', damage: '2d6+4', range: 'ranged' },
      { name: 'Combat Knife', damage: '1d6+3', range: 'melee' }
    ],
    xpReward: 200,
    lootTable: ['med_kit_large', 'ammo_rifle_x20', 'data_chip'],
    location: ['hephaestus_7'],
    description: 'หน่วยปฏิบัติการพิเศษของ Prometheus ชุดอุปกรณ์ระดับสูงสุด'
  },
  {
    enemyId: 'isu_agent',
    name: 'ISU Shadow Agent',
    hp: 40,
    ac: 15,
    si: 25,
    attacks: [
      { name: 'Suppressed Pistol', damage: '1d8+2', range: 'ranged' }
    ],
    xpReward: 150,
    lootTable: ['isu_badge', 'ammo_pistol_x12'],
    location: ['ares_base_i'],
    description: 'สายลับปฏิบัติการ ISU เชี่ยวชาญการแฝงตัวและการสังหารเงียบ'
  },
  {
    enemyId: 'corrupted_drone',
    name: 'Corrupted Mining Drone',
    hp: 20,
    ac: 12,
    si: 0,
    attacks: [
      { name: 'Drill Strike', damage: '2d4+2', range: 'melee' }
    ],
    xpReward: 75,
    lootTable: ['drone_parts', 'power_cell_small'],
    location: ['prometheus_mining', 'hephaestus_7'],
    description: 'โดรนขุดแร่ที่ถูก RELAY-7 แฮ็กและสั่งการโจมตี'
  },
  {
    enemyId: 'warren_raider',
    name: 'Warren Raider',
    hp: 25,
    ac: 11,
    si: 10,
    attacks: [
      { name: 'Scrap Shotgun', damage: '2d6', range: 'ranged' },
      { name: 'Shiv', damage: '1d4+1', range: 'melee' }
    ],
    xpReward: 80,
    lootTable: ['scrap_metal', 'ration_pack'],
    location: ['forgotten_warrens'],
    description: 'นักปล้นจาก The Forgotten Warrens สิ้นหวังและอันตราย'
  }
];

module.exports = enemies;
