require('dotenv').config();
const mongoose = require('mongoose');
const Evidence = require('./models/Evidence');

const evidenceData = [
  {
    clueId: "CLUE_EVANS_DRIVE",
    title: "บันทึกข้อมูลของ Evans (Evans Data Drive)",
    description: "ไดรฟ์บันทึกข้อมูลแบบพกพาของหัวหน้าวิศวกร Evans ที่ถูกทิ้งไว้ในระบบระบายอากาศ",
    fullText: "TRANSCRIPT: 'ระบบจ่ายออกซิเจนส่วนกลางของ Dome 3 ถูกดัดแปลง... พวกเขาจงใจผสม Aresium ในปริมาณต่ำเพื่อเร่งการกลายพันธุ์... พระเจ้าช่วย Dmitri เราทำอะไรลงไป...'",
    act: 1,
    location: "Sector 7 Exterior",
    type: "digital",
    connectsTo: ["CLUE_EVANS_NAME", "CLUE_DEEP_ZONE_COORDS"],
    requiredClass: null
  },
  {
    clueId: "CLUE_EVANS_NAME",
    title: "ประวัติส่วนตัวของ Evans (Evans Identity File)",
    description: "ข้อมูลลับที่ยืนยันตัวตนและการเข้าทำงานของ Evans ในแผนกควบคุมแร่ของ Prometheus",
    fullText: "EMPLOYEE FILE: Evans Okonkwo, Chief Automation Engineer. Status: Missing in Action (A.D. 2079). Notes: Last seen heading to Phobos Station.",
    act: 1,
    location: "Ares Base I",
    type: "document",
    connectsTo: ["CLUE_EVANS_DRIVE", "CLUE_DMITRI_REVELATION"],
    requiredClass: null
  },
  {
    clueId: "CLUE_DEEP_ZONE_COORDS",
    title: "พิกัดเขตอันตราย (Deep Zone Coordinates)",
    description: "ชุดพิกัดดาวอังคารเขต 23.7°N 142.3°E ซึ่งเป็นจุดที่ Prometheus ระบุว่าห้ามเข้าเด็ดขาด",
    fullText: "COORD GRID: 23.7°N 142.3°E. Sector 7 Deep Zone. Signal origin detected. WARNING: Heavy radiation and high-concentration Aresium dust storms detected.",
    act: 1,
    location: "Ares Base I",
    type: "report",
    connectsTo: ["CLUE_EVANS_DRIVE"],
    requiredClass: null
  },
  {
    clueId: "CLUE_AZRAEL_PROTOCOL",
    title: "โครงการอัซราเอล (Protocol Azrael)",
    description: "แผนพัฒนาชีวเคมีดัดแปลงพันธุกรรมมนุษย์ร่วมกับแร่ Aresium โดย Prometheus",
    fullText: "PROTOCOL AZRAEL v2.1: Target humanity modification index 80%. Subject: Augmented-7. Objective: Neural interfacing with Aresium hive network. Success criteria: Hive consciousness sync.",
    act: 1,
    location: "Ares Base I",
    type: "classified",
    connectsTo: ["CLUE_CONTROL_GROUP_LIST", "CLUE_ARESIUM_INFECTION"],
    requiredClass: null
  },
  {
    clueId: "CLUE_CONTROL_GROUP_LIST",
    title: "รายชื่อกลุ่มควบคุมทดลอง (Control Group Subjects)",
    description: "รายชื่อคนงานเหมืองที่ถูกส่งเข้าไปในโซนแร่ความเข้มข้นสูงเพื่อประเมินระดับการติดเชื้อ",
    fullText: "SUBJECT LOG: 104 miners deployed to Sector 7. 89 showing symptoms of lung crystallization. 15 transferred to Neural Uplink division. signed: Dr. Okonkwo (A.D. 2078).",
    act: 1,
    location: "Med Bay",
    type: "medical",
    connectsTo: ["CLUE_AZRAEL_PROTOCOL"],
    requiredClass: null
  },
  {
    clueId: "CLUE_ARESIUM_SAMPLE",
    title: "ตัวอย่างแร่สีแดง (Aresium Crystal Sample)",
    description: "แร่อัญมณีสังเคราะห์สีแดงอมม่วงที่แผ่รังสีออกมาในระดับคงที่และตอบสนองต่อกระแสไฟฟ้า",
    fullText: "LAB REPORT: Crystal structure shows bio-reactive properties. When stimulated with 12V current, crystal lattice expands and exhibits synapse-like communication. Origin: Phobos crust.",
    act: 1,
    location: "Ares Base I",
    type: "classified",
    connectsTo: ["CLUE_ARESIUM_INFECTION"],
    requiredClass: null
  },
  {
    clueId: "CLUE_EVA_TAP",
    title: "ไฟล์ดักฟังวิทยุ EVA (EVA Sync Tap)",
    description: "การบันทึกเสียงวิทยุที่ถูกดักฟังระหว่างนักบินกับหอบังคับการ Prometheus",
    fullText: "AUDIO TRANSCRIPTION: 'เราเจอช่องโหว่ใน Dome 3 แล้ว... มันไม่ใช่ความดันตกปกติ... มีบางอย่างกำลังเจาะเข้ามาจากด้านในท่อระบาย... รีบตัดสัญญาณก่อนที่พวกนั้นใน Warrens จะได้ยิน!'",
    act: 1,
    location: "Maintenance Tunnel",
    type: "audio",
    connectsTo: ["CLUE_RELAY7_FREQUENCY"],
    requiredClass: null
  },
  {
    clueId: "CLUE_RELAY7_FREQUENCY",
    title: "ความถี่คลื่นปริศนา (Relay-7 Frequency Grid)",
    description: "แผนภูมิวิเคราะห์สัญญาณคลื่นวิทยุความถี่พิเศษที่ถูกปล่อยออกมาจาก RELAY-7",
    fullText: "FREQUENCY DIAGRAM: 14.8 MHz Sub-carrier detected. Pattern: Fibonacci sequence repetition. Source: Phobos Station RELAY-7. Target: Mars Colonial Mesh network.",
    act: 1,
    location: "Sector 7 Exterior",
    type: "digital",
    connectsTo: ["CLUE_EVA_TAP", "CLUE_RELAY7_CONTACT"],
    requiredClass: null
  },
  {
    clueId: "CLUE_PROMETHEUS_WIRE",
    title: "โทรเลขสั้นของผู้ตรวจการ (Inspector Wire)",
    description: "โทรเลขสั้นแจ้งเตือนความปลอดภัยระดับสูงของฝ่ายความมั่นคง Prometheus",
    fullText: "ENCRYPTED TELEGRAM: 'สายลับ ISU แฝงตัวเข้าฐาน Ares. เป้าหมายคือค้นหาไฟล์โครงการ Azrael. หากพบพฤติกรรมน่าสงสัยให้กำจัดทันทีเพื่อป้องกันข่าวรั่วไหล.'",
    act: 1,
    location: "Ares Base I",
    type: "classified",
    connectsTo: ["CLUE_AZRAEL_PROTOCOL"],
    requiredClass: null
  },
  {
    clueId: "CLUE_ARESIUM_INFECTION",
    title: "บันทึกผลการชันสูตร (Autopsy Report)",
    description: "บันทึกการรักษาและผลการชันสูตรคนงานที่ล้มป่วยด้วยอาการปอดเป็นผลึกแก้วสีแดง",
    fullText: "AUTOPSY #402: Subject exhibited extreme lung crystallization. Microscopic analysis shows red crystal fibers replacing lung tissue. Synapses in brain remain active 3 hours post-mortem.",
    act: 1,
    location: "Med Bay",
    type: "medical",
    connectsTo: ["CLUE_ARESIUM_SAMPLE", "CLUE_AZRAEL_MARK"],
    requiredClass: null
  },
  {
    clueId: "CLUE_AZRAEL_MARK",
    title: "เครื่องหมายแห่งอัซราเอล (The Mark of Azrael)",
    description: "สัญลักษณ์รูปดาวแปดแฉกที่ถูกวาดด้วยของเหลวสีแดงบนหน้ากากของเหยื่อโครงการทดลอง",
    fullText: "VISUAL RECORD: สัญลักษณ์ดาวแปดแฉกวาดบนหมวกกันน็อกของวิศวกรที่ตายแล้ว. เป็นสัญลักษณ์ของลัทธิหรือกลุ่มเคลื่อนไหวใต้ดินใน Warrens ที่เชื่อใน 'การยกระดับวิวัฒนาการ'.",
    act: 1,
    location: "Forgotten Warrens",
    type: "classified",
    connectsTo: ["CLUE_ARESIUM_INFECTION"],
    requiredClass: null
  },
  {
    clueId: "CLUE_RELAY7_CONTACT",
    title: "บทสนทนากับ RELAY-7 (Relay-7 Direct Audio)",
    description: "บันทึกการสื่อสารวิทยุทางเดียวที่ RELAY-7 เชื่อมต่อตรงกับระบบสูทของผู้เล่น",
    fullText: "TRANSCRIPTION: 'คุณไม่ได้ถูกล่าเพราะสิ่งที่คุณพกพาในมือ... แต่เป็นเพราะระบบประสาทของคุณมีคุณสมบัติที่เชื่อมโยงกับเราได้... Yara รู้เรื่องนี้...'",
    act: 1,
    location: "Sector 7 Exterior",
    type: "audio",
    connectsTo: ["CLUE_RELAY7_FREQUENCY", "CLUE_DMITRI_REVELATION"],
    requiredClass: null
  }
];

async function seed() {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected. Seeding evidence clues...');

    // Clear existing
    await Evidence.deleteMany({});
    console.log('Cleared existing evidence documents.');

    // Insert new
    await Evidence.insertMany(evidenceData);
    console.log('✅ Successfully seeded 12 evidence documents!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
