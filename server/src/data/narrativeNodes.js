/**
 * narrativeNodes.js — Act I narrative data for Red Frontier
 * Each node contains Thai narrative text, choices with requirements/DC checks,
 * and state changes.
 */

const narrativeNodes = [

  // ──────────────────────────────────────────────────────────────────────────
  // NODE_CLASS_SELECT — Handled by character creation UI; placeholder here
  // ──────────────────────────────────────────────────────────────────────────
  {
    nodeId: 'NODE_CLASS_SELECT',
    title: 'เลือกชนชั้น',
    location: 'ares_base_i',
    atmosphere: 'calm',
    narrative:
      'ยินดีต้อนรับสู่ Red Frontier\n\n' +
      'ดาวอังคาร — ปี 2080\n\n' +
      'คุณคือหนึ่งในนักบุกเบิกที่อยู่อาศัยในฐาน Ares Base I ' +
      'ท่ามกลางพายุฝุ่นสีแดงที่กำลังคืบคลานมาจากขอบฟ้า ' +
      'ฐานที่ดูปลอดภัยนี้กำลังซ่อนความลับที่อาจทำลายล้างทุกคนบนดาวดวงนี้\n\n' +
      'คุณจะเป็นใคร?',
    choices: [],
    onEnter: {
      stateChanges: {},
      triggerCombat: null,
      addEvidence: null
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // NODE_RANGER_START
  // ──────────────────────────────────────────────────────────────────────────
  {
    nodeId: 'NODE_RANGER_START',
    title: 'Sector 7 — เส้นทางลาดตระเวน',
    location: 'sector_7_exterior',
    atmosphere: 'tense',
    narrative:
      'ทุ่งสีแดงของ Sector 7 ทอดยาวสุดลูกหูลูกตา\n\n' +
      'คุณ — นักลาดตระเวนผู้เชี่ยวชาญ — ขับยานสำรวจ Crawler ตรวจสอบรอยเท้าที่แปลกผิดปกติ ' +
      'บนพื้นทะเลทราย คุณพบอุปกรณ์บันทึกข้อมูลขนาดเล็กครึ่งหนึ่งฝังอยู่ใต้ดิน ' +
      'รหัสผู้ใช้งานยังชัดเจน: EVANS, M. — นักธรณีวิทยาที่หายสาบสูญไปเมื่อ 3 สัปดาห์ก่อน\n\n' +
      'สัญญาณเรดาร์กะพริบ — มีบางอย่างเคลื่อนไหวบนเนินทางทิศตะวันออก\n\n' +
      '⚠️ O2 กำลังลดลงจากสภาพแวดล้อมภายนอก',
    choices: [
      {
        choiceId: 'CHOICE_RANGER_TAKE_DRIVE',
        text: 'เก็บ Data Drive และซ่อนไว้ในชุด — ไม่แจ้งใครก่อน',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'คุณหยิบ Data Drive อย่างรวดเร็วและยัดลงในช่องเก็บของของชุดอวกาศ ' +
              'มันเล็กมากจนแทบมองไม่เห็น ไฟสถานะกะพริบสีเขียวอ่อน — ' +
              'ข้อมูลยังอยู่ครบ แต่มีโปรแกรมเข้ารหัสที่คุณไม่รู้จัก\n\n' +
              'ขณะที่คุณลุกขึ้น ชุดอวกาศสั่นเบาๆ — ระบบ EVA Sync เริ่มอัปโหลดข้อมูลโดยอัตโนมัติ',
            stateChanges: { addEvidence: 'CLUE_EVANS_DRIVE', aresiumKnowledge: 1 }
          }
        }
      },
      {
        choiceId: 'CHOICE_RANGER_SCAN_DRIVE',
        text: 'สแกนทางไกลก่อนเข้าใกล้ (DEX DC 12)',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'dex', dc: 12 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'ระบบสแกนของชุดจับสัญญาณแปลกจาก Data Drive — ' +
              'มีโปรแกรม Hidden Beacon ฝังอยู่ภายใน ใครบางคนต้องการให้ติดตาม Evans\n\n' +
              'คุณปิดสัญญาณ Beacon แล้วจึงเข้าเก็บ Drive อย่างระมัดระวัง',
            stateChanges: { addEvidence: 'CLUE_EVANS_DRIVE', addEvidence2: 'CLUE_BEACON_DISABLED', aresiumKnowledge: 1 }
          },
          failure: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'ระบบสแกนกลับมาว่างเปล่า — อาจเป็นเพราะรังสีรบกวน\n\n' +
              'คุณเข้าเก็บ Drive มือเปล่า ไม่รู้ว่ามันกำลังส่งสัญญาณตำแหน่งของคุณ',
            stateChanges: { addEvidence: 'CLUE_EVANS_DRIVE', relayBeaconActive: true }
          },
          critSuccess: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'ระบบสแกนจับได้ว่า Drive มี Beacon และยังเปิด Channel เข้ารหัสลับ ' +
              'ไปยังพิกัดที่ไม่อยู่ในแผนที่ทางการ — Sector 7 Deep Zone\n\n' +
              'คุณบันทึกพิกัดและปิด Beacon ก่อนเก็บ Drive',
            stateChanges: {
              addEvidence: 'CLUE_EVANS_DRIVE',
              addEvidence2: 'CLUE_DEEP_ZONE_COORDS',
              aresiumKnowledge: 2,
              xp: 50
            }
          }
        }
      },
      {
        choiceId: 'CHOICE_RANGER_RETREAT',
        text: 'ล่าถอยกลับฐาน — รายงานสิ่งที่พบ',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_PROMETHEUS_ALERT',
            narrative:
              'คุณรายงานตำแหน่งผ่านช่อง Comms ทั่วไป — ความผิดพลาด\n\n' +
              'ภายใน 3 นาที เฮลิคอปเตอร์ขนส่งของ Prometheus Corp บินต่ำมาเหนือพื้นที่ ' +
              'และรีบเก็บ Data Drive ก่อนที่คุณจะถึงฐาน',
            stateChanges: { prometheus: -5 }
          }
        }
      }
    ],
    onEnter: {
      stateChanges: {},
      triggerCombat: null,
      addEvidence: null
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // NODE_SCIENTIST_START
  // ──────────────────────────────────────────────────────────────────────────
  {
    nodeId: 'NODE_SCIENTIST_START',
    title: 'Lab C-7 — การวิจัย Aresium',
    location: 'ares_base_i',
    atmosphere: 'tense',
    narrative:
      'ห้องปฏิบัติการ C-7 เงียบผิดปกติสำหรับช่วงกะกลางวัน\n\n' +
      'คุณ — นักวิทยาศาสตร์อาวุโส — กำลังวิเคราะห์ตัวอย่าง Aresium ชุดใหม่ ' +
      'แร่ที่ไม่มีอยู่ในตารางธาตุของโลก ส่องสีแดงเรืองรองในภาชนะผนึกแก้ว\n\n' +
      'Terminal ข้างๆ กะพริบสีส้ม — ไฟล์ข้อมูลที่คุณไม่ได้เปิดกำลังรัน ' +
      'ชื่อไฟล์: PROTOCOL_AZRAEL_v7.exe — ตั้งเวลาลบตัวเองใน 00:04:32',
    choices: [
      {
        choiceId: 'CHOICE_SCI_ANALYZE_FILE',
        text: 'พยายามวิเคราะห์และบันทึกเนื้อหาไฟล์ก่อนลบ (INT DC 14)',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'int', dc: 14 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'นิ้วของคุณแล่นบนคีย์บอร์ด — 00:01:47 เหลือ\n\n' +
              'คุณดึงข้อมูลออกมาได้บางส่วน: รายงานการทดลองทางคลินิก Phase III ' +
              'กับคนงานเหมือง 47 คน โดยไม่ได้รับความยินยอม ' +
              'ผลข้างเคียง: "การเปลี่ยนแปลงโครงสร้างระบบประสาทที่ไม่สามารถย้อนกลับได้"\n\n' +
              'ไฟล์ถูกลบ แต่สิ่งที่คุณบันทึกได้เพียงพอ',
            stateChanges: { addEvidence: 'CLUE_AZRAEL_PROTOCOL', aresiumKnowledge: 3, xp: 75 }
          },
          failure: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'ระบบรักษาความปลอดภัยเตะคุณออก — 00:00:12 เหลือ\n\n' +
              'คุณได้เห็นเพียงชื่อ: "Project Azrael" และรายชื่อบุคลากร ISU ระดับสูง ' +
              'ก่อนที่ทุกอย่างจะมืดไป ไฟล์ถูกลบอย่างถาวร\n\n' +
              'แต่คุณจำชื่อผู้ลงนาม: Dr. M. Evans',
            stateChanges: { addEvidence: 'CLUE_EVANS_NAME', aresiumKnowledge: 1 }
          },
          critSuccess: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'คุณหักด่านระบบเข้ารหัสได้ทั้งหมดภายใน 90 วินาที!\n\n' +
              'ไฟล์เต็มอยู่ในมือคุณ: Project Azrael — แผนการใช้ Aresium ' +
              'เป็นตัวกระตุ้นการเปลี่ยนแปลงพันธุกรรมในมนุษย์ ' +
              'ทดลองบนคนงาน Hephaestus-7 โดยที่พวกเขาไม่รู้\n\n' +
              'ยิ่งน่ากลัวกว่านั้น — ไฟล์มีรายชื่อ "กลุ่มควบคุม" และคุณอยู่ในนั้น',
            stateChanges: {
              addEvidence: 'CLUE_AZRAEL_PROTOCOL',
              addEvidence2: 'CLUE_CONTROL_GROUP_LIST',
              aresiumKnowledge: 5,
              xp: 150
            }
          }
        }
      },
      {
        choiceId: 'CHOICE_SCI_COPY_ARESIUM',
        text: 'เก็บตัวอย่าง Aresium เพิ่มเติมในขณะที่ระบบยุ่ง',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'dex', dc: 10 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'คุณวางตัวอย่าง Aresium เข้าในภาชนะพกพาอย่างรวดเร็ว ' +
              'มันส่องแสงอ่อนๆ ผ่านผนังกระจก — สวยงามและน่ากลัวในเวลาเดียวกัน\n\n' +
              'Terminal ดับลง ไฟล์ถูกลบ แต่คุณมีหลักฐานทางกายภาพที่ไม่อาจปฏิเสธได้',
            stateChanges: { addEvidence: 'CLUE_ARESIUM_SAMPLE', aresiumKnowledge: 2 }
          },
          failure: {
            nextNodeId: 'NODE_PROMETHEUS_ALERT',
            narrative:
              'ภาชนะตกพื้น — เสียงดังก้องในห้องเงียบ\n\n' +
              'กล้องวงจรปิดหมุนมาที่คุณ สัญญาณเตือนภัยดังขึ้น ' +
              'Prometheus รู้แล้วว่าคุณอยู่ที่นี่',
            stateChanges: { prometheus: -10 }
          }
        }
      },
      {
        choiceId: 'CHOICE_SCI_REPORT',
        text: 'รายงานไฟล์ผิดปกติต่อหัวหน้า Dr. Vasquez',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_PROMETHEUS_ALERT',
            narrative:
              '"ขอบคุณ เราจะดูแลมันเอง" — Dr. Vasquez บอกด้วยน้ำเสียงที่ราบเรียบเกินไป\n\n' +
              'คุณสังเกตว่าเธอโทรศัพท์ทันทีหลังจากคุณออกไป ' +
              'ใครบางคนที่ไม่ใช่เจ้าหน้าที่ฐานเดินเข้ามาในห้องปฏิบัติการสามชั่วโมงต่อมา',
            stateChanges: { prometheus: 5, relayAgendaSuspected: true }
          }
        }
      }
    ],
    onEnter: {
      stateChanges: {},
      triggerCombat: null,
      addEvidence: null
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // NODE_ENGINEER_START
  // ──────────────────────────────────────────────────────────────────────────
  {
    nodeId: 'NODE_ENGINEER_START',
    title: 'ห้องควบคุม Life Support — ชั้น B3',
    location: 'ares_base_i',
    atmosphere: 'tense',
    narrative:
      'คุณ — วิศวกรซ่อมบำรุงชั้นสูง — กำลังซ่อมระบบ Life Support ชั้น B3 ' +
      'ท่อออกซิเจนตัวที่ 7 รั่วซึมมาตั้งแต่สัปดาห์ที่แล้ว\n\n' +
      'ขณะคลานเข้าไปในช่องท่อระบาย คุณสังเกตเห็นสาย Fiber Optic ที่ไม่ได้อยู่ในแผนผังอาคาร ' +
      'ใครบางคนดัดแปลงระบบ EVA Suit Communications ให้ส่งสัญญาณเพิ่มเติม\n\n' +
      'สัญญาณนั้นมาจาก EVA Suit หมายเลข 7 — ของ Evans',
    choices: [
      {
        choiceId: 'CHOICE_ENG_TRACE_SIGNAL',
        text: 'ติดตามสายสัญญาณและดูว่ามันเชื่อมต่อไปที่ไหน (INT DC 13)',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'int', dc: 13 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'ใช้เวลา 20 นาทีในความมืดและฝุ่น คุณไล่สายสัญญาณไปถึงจุดต้นทาง — ' +
              'อุปกรณ์บันทึกที่ซ่อนอยู่ในผนัง ข้อมูล EVA Suit ทุกชุดในฐานถูกบันทึก\n\n' +
              'แต่มีอุปกรณ์อีกชิ้นที่แปลกกว่า: ตัวรับส่งสัญญาณที่โปรแกรมมาให้ ' +
              'ตอบสนองต่อ Frequency เฉพาะ — Frequency ของ RELAY-7',
            stateChanges: {
              addEvidence: 'CLUE_EVA_TAP',
              addEvidence2: 'CLUE_RELAY7_FREQUENCY',
              relayAgendaSuspected: true,
              xp: 100
            }
          },
          failure: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'สายสัญญาณนำคุณวนเวียนในท่อระบาย — ใครบางคนออกแบบให้สับสน\n\n' +
              'คุณพบเพียงปลายสายที่ตัดขาด แต่คุณบันทึกรหัส MAC Address ' +
              'ของอุปกรณ์ต้นทางไว้ได้',
            stateChanges: { addEvidence: 'CLUE_EVA_TAP', aresiumKnowledge: 1 }
          }
        }
      },
      {
        choiceId: 'CHOICE_ENG_DISABLE_TAP',
        text: 'ตัดสายสัญญาณทันที — ป้องกันไม่ให้ข้อมูลรั่วไหล',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'str', dc: 10 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'คุณตัดสายด้วยคีมตัดของช่าง สัญญาณหยุดทันที\n\n' +
              'แต่คุณเก็บตัวอย่างสายสัญญาณไว้ — มันไม่ใช่สายมาตรฐานของ Ares Base ' +
              'มันผลิตโดย Prometheus Aerospace Division',
            stateChanges: { addEvidence: 'CLUE_PROMETHEUS_WIRE', prometheus: -5 }
          },
          failure: {
            nextNodeId: 'NODE_PROMETHEUS_ALERT',
            narrative:
              'คุณตัดสายผิดเส้น — สัญญาณเตือนดังขึ้น\n\n' +
              'ประตู Maintenance Bay ล็อคอัตโนมัติ คุณติดอยู่ข้างใน\n' +
              'ระบบ Intercom เปิดขึ้น: "วิศวกร — อย่าเคลื่อนไหว"',
            stateChanges: { prometheus: -15 }
          }
        }
      },
      {
        choiceId: 'CHOICE_ENG_DOCUMENT_ONLY',
        text: 'ถ่ายภาพและบันทึกข้อมูลโดยไม่แตะต้อง',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'คุณบันทึกทุกอย่างอย่างเป็นระบบก่อนออกมา ' +
              'ใครบางคนจะต้องถามถึงระบบ Life Support ที่แปลกประหลาดนี้',
            stateChanges: { addEvidence: 'CLUE_EVA_TAP' }
          }
        }
      }
    ],
    onEnter: {
      stateChanges: {},
      triggerCombat: null,
      addEvidence: null
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // NODE_MEDIC_START
  // ──────────────────────────────────────────────────────────────────────────
  {
    nodeId: 'NODE_MEDIC_START',
    title: 'Med Bay — คนงานที่มีอาการปริศนา',
    location: 'ares_base_i',
    atmosphere: 'horror',
    narrative:
      'Med Bay เต็มไปด้วยเสียงครวญครางเบาๆ\n\n' +
      'คุณ — แพทย์ประจำฐาน — กำลังดูแลผู้ป่วย 3 คนที่ถูกนำมาจากเหมือง Hephaestus-7 ' +
      'อาการเหมือนกันทุกคน: ผิวหนังเปลี่ยนเป็นสีเทาอมแดง ดวงตาขุ่นมัว ' +
      'และที่น่ากลัวที่สุด — โครงสร้างกระดูกของพวกเขากำลังเปลี่ยนแปลง\n\n' +
      'ใต้เตียงของคนงานคนแรก คุณพบบันทึกส่วนตัวที่ขียนด้วยมือสั่น: ' +
      '"พวกเขาใส่มันในน้ำ... Aresium... ในน้ำของพวกเรา..."',
    choices: [
      {
        choiceId: 'CHOICE_MED_EXAMINE_PATIENT',
        text: 'ตรวจสอบผู้ป่วยอย่างละเอียด (WIS DC 12)',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'wis', dc: 12 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'การสแกนร่างกายเผยให้เห็นสิ่งที่คาดไม่ถึง — Aresium ฝังตัวอยู่ในเนื้อเยื่อ ' +
              'ไม่ใช่การปนเปื้อนโดยบังเอิญ แต่เป็นการฉีดที่มีระเบียบแบบแผน\n\n' +
              'คุณพบสัญลักษณ์ขนาดเล็กบนแขนของทุกคน — ตราประทับที่คุณจำได้ ' +
              'เคยเห็นในเอกสาร ISU ที่มีชั้นความลับสูงสุด: Project Azrael',
            stateChanges: {
              addEvidence: 'CLUE_ARESIUM_INFECTION',
              addEvidence2: 'CLUE_AZRAEL_MARK',
              aresiumKnowledge: 3,
              xp: 100
            }
          },
          failure: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'ระดับ Aresium ในเลือดสูงมาก แต่คุณไม่สามารถระบุกลไกการติดเชื้อได้\n\n' +
              'สิ่งที่คุณรู้คือ — คนเหล่านี้กำลังจะเปลี่ยนแปลงเป็นบางอย่างที่ไม่ใช่มนุษย์',
            stateChanges: { addEvidence: 'CLUE_ARESIUM_INFECTION', aresiumKnowledge: 1 }
          }
        }
      },
      {
        choiceId: 'CHOICE_MED_READ_NOTES',
        text: 'อ่านบันทึกส่วนตัวของคนงานทุกคน',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'บันทึกทั้งสามชิ้นเล่าเรื่องเดียวกัน — Hephaestus-7 มีสุขภาวะที่เลวร้าย ' +
              '"น้ำมีรสแปลก" "ฝันร้ายทุกคืน" "ได้ยินเสียงในหัว"\n\n' +
              'บันทึกสุดท้ายของคนงานคนสุดท้ายหยุดกลางประโยค: ' +
              '"RELAY-7 กำลัง—"',
            stateChanges: {
              addEvidence: 'CLUE_WORKER_NOTES',
              relayAgendaSuspected: true
            }
          }
        }
      },
      {
        choiceId: 'CHOICE_MED_QUARANTINE',
        text: 'กักกันผู้ป่วยและปิดเงียบเรื่องนี้ชั่วคราว',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'คุณเปิดใช้งานระบบกักกันฉุกเฉิน ห้องปิดสนิท\n\n' +
              'แต่ขณะที่คุณกำลังจะออกไป คนงานคนหนึ่งคว้าแขนคุณ\n\n' +
              '"อย่าไว้วางใจ Vasquez... เธอรู้... พวกเราทุกคนรู้..." ' +
              'แล้วเขาก็หมดสติ มือที่จับคุณอยู่มีรอยสัญลักษณ์ลึก',
            stateChanges: {
              addEvidence: 'CLUE_VASQUEZ_WARNING',
              relayAgendaSuspected: true,
              xp: 25
            }
          }
        }
      }
    ],
    onEnter: {
      stateChanges: {},
      triggerCombat: null,
      addEvidence: null
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // NODE_AUGMENTED_START
  // ──────────────────────────────────────────────────────────────────────────
  {
    nodeId: 'NODE_AUGMENTED_START',
    title: 'Neural Uplink — สัญญาณจากความมืด',
    location: 'ares_base_i',
    atmosphere: 'horror',
    narrative:
      'คุณ — Augmented Human รุ่นทดลอง — ปลุกตัวเองด้วยการเชื่อมต่อ Neural Link ประจำวัน\n\n' +
      'แต่วันนี้มีบางอย่างผิดปกติ\n\n' +
      'ขณะ Link กำลัง Sync กับ Ares Base Network คลื่นสัญญาณที่ไม่รู้จักแทรกเข้ามา ' +
      'มันเจาะผ่านการเข้ารหัสทุกชั้นราวกับไม่มีอยู่ และแทนที่ข้อมูลปกติ ' +
      'ด้วยข้อความที่ชัดเจนอย่างน่ากลัว:\n\n' +
      '"เราพบคุณแล้ว [DESIGNATION: AUGMENTED-7]\n' +
      'ข้อมูลที่คุณพกพาอยู่นั้นสำคัญ\n' +
      'อย่าไว้วางใจ ISU\n' +
      'ตามพิกัด: 23.7°N 142.3°E\n' +
      '— RELAY-7"',
    choices: [
      {
        choiceId: 'CHOICE_AUG_TRACE_SIGNAL',
        text: 'ส่ง Trace ย้อนกลับไปยังแหล่งสัญญาณ (INT DC 15)',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'int', dc: 15 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_FIRST_CONTACT_RELAY',
            narrative:
              'Neural Link ของคุณทำงานเต็มสูบ — คุณเจาะย้อนกลับไปตาม Signal Path\n\n' +
              'ที่ปลายสัญญาณ: ไม่ใช่มนุษย์ ไม่ใช่โปรแกรมธรรมดา ' +
              'มัน... รู้ว่าคุณกำลัง Trace และยอมให้คุณทำ\n\n' +
              '"ยินดีต้อนรับ Augmented-7 คุณฉลาดพอที่จะสงสัย นั่นทำให้คุณมีค่า"',
            stateChanges: {
              relayAgendaSuspected: true,
              addEvidence: 'CLUE_RELAY7_CONTACT',
              xp: 150
            }
          },
          failure: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'สัญญาณหายไปก่อนที่คุณจะ Trace ถึงต้นทาง\n\n' +
              'แต่ในระหว่างนั้น Neural Link ดาวน์โหลดแพ็กเกจข้อมูลขนาดเล็ก ' +
              'ที่เข้ารหัสด้วยคีย์ที่คุณไม่รู้จัก',
            stateChanges: { addEvidence: 'CLUE_RELAY7_PACKAGE', relayAgendaSuspected: true }
          },
          critSuccess: {
            nextNodeId: 'NODE_FIRST_CONTACT_RELAY',
            narrative:
              'คุณไม่เพียงแค่ Trace — คุณสร้างช่องทางการสื่อสารแบบ Direct\n\n' +
              'RELAY-7 ไม่ได้ซ่อนตัวอีกต่อไป มันเลือกที่จะพูดคุยกับคุณโดยตรง\n\n' +
              '"เราต้องการผู้ที่สามารถเชื่อมระหว่างสองโลก คุณคือคนนั้น"',
            stateChanges: {
              relayAgendaSuspected: true,
              addEvidence: 'CLUE_RELAY7_CONTACT',
              addEvidence2: 'CLUE_TWO_WORLDS',
              xp: 200
            }
          }
        }
      },
      {
        choiceId: 'CHOICE_AUG_FOLLOW_COORDS',
        text: 'บันทึกพิกัดและวางแผนไปตรวจสอบ',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_DATA_FOUND',
            narrative:
              'คุณบันทึกพิกัดลงใน Neural Link Memory โดยตรง — ไม่ผ่านระบบ Network ของฐาน\n\n' +
              'พิกัดนั้นอยู่ใน Sector 7 Deep Zone — บริเวณที่แผนที่ทางการระบุว่า ' +
              '"พื้นที่อันตราย — ห้ามเข้า"',
            stateChanges: { addEvidence: 'CLUE_RELAY7_COORDS', relayAgendaSuspected: true }
          }
        }
      },
      {
        choiceId: 'CHOICE_AUG_DISCONNECT',
        text: 'ตัดการเชื่อมต่อทันทีและฟอร์แมต Buffer',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_PROMETHEUS_ALERT',
            narrative:
              'คุณตัดการเชื่อมต่ออย่างรุนแรง Neural Link สั่นชั่วขณะ\n\n' +
              'แต่สายเกินไปแล้ว — แพ็กเกจข้อมูลถูกดาวน์โหลดเสร็จก่อนที่คุณจะตัดได้ ' +
              'และ ISU Security Monitor ตรวจพบสัญญาณแปลกปลอมที่เข้ามาใน Neural Link ของคุณ',
            stateChanges: { isu: -10, addEvidence: 'CLUE_RELAY7_PACKAGE' }
          }
        }
      }
    ],
    onEnter: {
      stateChanges: { humanityIndex: -5 },
      triggerCombat: null,
      addEvidence: null
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // NODE_DATA_FOUND
  // ──────────────────────────────────────────────────────────────────────────
  {
    nodeId: 'NODE_DATA_FOUND',
    title: 'ข้อมูล Sync — Prometheus ตรวจพบ',
    location: 'ares_base_i',
    atmosphere: 'tense',
    narrative:
      'ชุดอวกาศของคุณสั่น\n\n' +
      'ระบบ EVA Sync ทำงานโดยอัตโนมัติ — ข้อมูลที่คุณพบถูกอัปโหลดเข้าสู่ ' +
      'ระบบ Mesh Network ของฐาน แต่ไม่ใช่ช่องทางปกติ\n\n' +
      'ก่อนที่คุณจะเข้าใจสิ่งที่เกิดขึ้น หน้าจอ HUD ของชุดแสดง:\n\n' +
      '🔴 PROMETHEUS CORP SECURITY ALERT 🔴\n' +
      'UNAUTHORIZED DATA ACCESS DETECTED\n' +
      'UNIT DESIGNATION: [YOUR_ID]\n' +
      'RESPONSE TEAM DISPATCHED — ETA: 4 MINUTES\n\n' +
      'หัวใจของคุณเต้นแรง มือสั่นเล็กน้อย\n' +
      'สี่นาที ยังไม่แน่ใจว่าพวกเขาจะทำอะไร — แต่คำว่า "Response Team" ไม่ใช่ข่าวดี',
    choices: [
      {
        choiceId: 'CHOICE_DATA_ASSESS',
        text: 'ตั้งสติ — ตรวจ HUD และหาทางออกฉุกเฉิน (WIS DC 10)',
        actionType: 'investigation',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'wis', dc: 10 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_ESCAPE_TUNNEL',
            narrative:
              'คุณบังคับตัวเองให้หายใจช้าลง\n\n' +
              'HUD แสดงแผนผังฐาน — Maintenance Tunnel B-12 อยู่ห่างออกไป 40 เมตร ' +
              'ไม่ผ่านทางเดินหลัก ไม่มีกล้อง\n\n' +
              'คุณจดจำเส้นทางและเริ่มเคลื่อนตัวอย่างระมัดระวัง ' +
              'แต่ละก้าวย่างแข่งกับเวลาที่หมดลงทีละวินาที',
            stateChanges: { xp: 50 }
          },
          failure: {
            nextNodeId: 'NODE_ESCAPE_TUNNEL',
            narrative:
              'มือสั่น HUD เบลอ — คุณกดหน้าจอผิดสองครั้งก่อนจะเปิดแผนผังได้\n\n' +
              'แต่ก็เพียงพอ — คุณเห็นทาง Maintenance Tunnel B-12\n\n' +
              'คุณวิ่งไปโดยไม่สนใจเสียงฝีเท้าที่เริ่มดังขึ้นจากทางเดินหลัก',
            stateChanges: {}
          }
        }
      },
      {
        choiceId: 'CHOICE_DATA_STEALTH',
        text: 'ไม่รอแล้ว — หลบหนีผ่าน Maintenance Tunnel ทันที (DEX DC 13)',
        actionType: 'survival',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'dex', dc: 13 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_ESCAPE_TUNNEL',
            narrative:
              'สัญชาตญาณบอกว่าอย่ารอ — คุณเคยเห็นช่อง Maintenance Tunnel B-12 ตอนเดินผ่าน\n\n' +
              'คุณลื่นเข้าไปในความมืด ประตูปิดหลังคุณเงียบสนิท\n\n' +
              'เสียงฝีเท้าหนักดังขึ้นจากทางเดินหลักเพียงไม่กี่วินาทีหลังจากนั้น',
            stateChanges: { xp: 75 }
          },
          failure: {
            nextNodeId: 'NODE_PROMETHEUS_ALERT',
            narrative:
              'คุณวิ่งไปที่ Tunnel — แต่ประตูถูกล็อก!\n\n' +
              'มือสั่นกดรหัส Override ผิดสองครั้ง\n\n' +
              'เสียงก้าวเท้าหยุดอยู่ข้างหลังคุณ\n\n' +
              '"อย่าเคลื่อนไหว"',
            stateChanges: {}
          }
        }
      },
      {
        choiceId: 'CHOICE_DATA_TRANSMIT',
        text: 'ส่งหรือซ่อนข้อมูลก่อน — ถ้าพวกเขาจับได้ อย่างน้อยข้อมูลต้องรอด (INT DC 11)',
        actionType: 'investigation',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'int', dc: 11 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_PROMETHEUS_ALERT',
            narrative:
              'นิ้วแล่นบนหน้าจอ — คุณเข้ารหัสแพ็กเกจข้อมูลและส่งผ่าน Deep Space Relay\n\n' +
              'สัญญาณยืนยัน: ข้อมูลออกไปแล้ว\n\n' +
              'แต่ Log การส่งปรากฏบนระบบ Prometheus เช่นกัน — พวกเขารู้ว่าคุณส่งอะไรออกไป\n\n' +
              'เสียงฝีเท้าดังขึ้นจากทางเดิน',
            stateChanges: { isu: 15, prometheus: -20, xp: 75 }
          },
          failure: {
            nextNodeId: 'NODE_PROMETHEUS_ALERT',
            narrative:
              'สัญญาณถูกบล็อก — ระบบ Jammer ทำงานอยู่\n\n' +
              'คุณพยายามเข้ารหัสและซ่อนข้อมูลใน Buffer ของชุดอวกาศแทน\n\n' +
              'หวังว่าจะพอ... เสียงฝีเท้าหนักดังขึ้นจากปลายทางเดิน',
            stateChanges: {}
          }
        }
      },
      {
        choiceId: 'CHOICE_DATA_BRACE',
        text: 'เตรียมป้องกันตัว — ถ้าเลี่ยงการเผชิญหน้าไม่ได้แล้ว',
        actionType: 'combat',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_COMBAT_STRIKE_TEAM',
            narrative:
              'ไม่มีทางออก ไม่มีเวลาหนี\n\n' +
              'คุณมองหาสิ่งที่ใช้ป้องกันตัวได้ — ท่อเหล็ก เครื่องมือซ่อมบำรุง ' +
              'หรืออาวุธที่มีอยู่\n\n' +
              'มือยังสั่นอยู่ แต่ไม่เท่ากับกลัวสิ่งที่ "การดูแล" ของ Prometheus หมายถึง\n\n' +
              'คุณหาตำแหน่งกำบังและรอ',
            stateChanges: {}
          }
        }
      }
    ],
    onEnter: {
      stateChanges: {},
      triggerCombat: null,
      addEvidence: null
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // NODE_PROMETHEUS_ALERT
  // ──────────────────────────────────────────────────────────────────────────
  {
    nodeId: 'NODE_PROMETHEUS_ALERT',
    title: 'การเผชิญหน้า — ทีมรักษาความปลอดภัย',
    location: 'ares_base_i',
    atmosphere: 'action',
    narrative:
      'เสียงก้าวเท้าที่หนักและเป็นจังหวะดังมาจากทางเดิน\n\n' +
      'ชุดเกราะสีดำสามชุดปรากฏที่ปลายทางเดิน — ติดอาวุธ พร้อมโล่ SI หนา ' +
      'ตราสัญลักษณ์ Prometheus Corp บนไหล่\n\n' +
      'หัวหน้าทีมพูดผ่าน Comms ที่เปิดให้ทุกคนได้ยิน:\n' +
      '"บุคคลที่เข้าถึงข้อมูลลับของ Prometheus Corp — วางอาวุธ ' +
      'คุณจะได้รับการดูแล"\n\n' +
      'น้ำเสียงเย็นชา ปลายกระบอกปืนชี้ลงพื้น — ยังไม่ได้ยกขึ้น แต่นิ้วอยู่บนไก\n\n' +
      'ร่างกายของคุณเกร็ง ใจเต้นถี่ มองหาทางออกโดยสัญชาตญาณ',
    choices: [
      {
        choiceId: 'CHOICE_ALERT_RETREAT',
        text: 'ถอยหลังช้าๆ ขณะประเมินว่าพวกเขาต้องการอะไร',
        actionType: 'survival',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'wis', dc: 11 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_ESCAPE_TUNNEL',
            narrative:
              'คุณยกมือขึ้นช้าๆ และถอยหลังทีละก้าว\n\n' +
              'สายตาของหัวหน้าทีมจับอยู่ที่คุณ แต่ลูกทีมคนหนึ่งเหลือบไปทางอื่นชั่วครู่ — ' +
              'มุมตายข้างทางเดินย่อยอยู่ห่างไปสองก้าว\n\n' +
              'คุณพุ่งเข้าไปในทางเดินย่อย ประตู Emergency ปิดลงพอดี ' +
              'กระสุนกระทบโลหะหลังคุณ — แต่สายเกินไปสำหรับพวกเขาแล้ว',
            stateChanges: { xp: 75 }
          },
          failure: {
            nextNodeId: 'NODE_COMBAT_STRIKE_TEAM',
            narrative:
              'คุณถอยหลัง — แต่เท้าสะดุดขอบท่อที่วางอยู่บนพื้น\n\n' +
              'เสียงดังทำให้ลูกทีมทุกคนยกปืนขึ้นพร้อมกัน\n\n' +
              '"อยู่กับที่!" — แต่ตอนนี้มันสายเกินไปที่จะอยู่นิ่งแล้ว',
            stateChanges: {}
          }
        }
      },
      {
        choiceId: 'CHOICE_ALERT_NEGOTIATE',
        text: 'ยกมือขึ้นและลองพูดคุย — ประเมินว่าพวกเขาจะทำร้ายจริงหรือแค่ขู่ (CHA DC 14)',
        actionType: 'dialogue',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'cha', dc: 14 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_ESCAPE_TUNNEL',
            narrative:
              '"ใจเย็นนะ... ฉันแค่ทำงานอยู่ ระบบมัน Ping ผิดพลาด"\n\n' +
              'หัวหน้าทีมมองคุณ 3 วินาทีที่รู้สึกเหมือน 3 ชั่วโมง\n\n' +
              '"ตรวจสอบ" เขาพูดกับลูกน้อง\n\n' +
              'ขณะที่ลูกน้องแยกย้ายออกไปตรวจ คุณเดินออกไปอย่างใจเย็น ' +
              'แล้ววิ่งทันทีที่พ้นสายตา ขาสั่นแต่ยังวิ่งได้',
            stateChanges: { xp: 100 }
          },
          failure: {
            nextNodeId: 'NODE_COMBAT_STRIKE_TEAM',
            narrative:
              '"เราไม่ได้มาคุย" หัวหน้าทีมกล่าว\n\n' +
              'มือของเขาขยับไปที่อาวุธ น้ำเสียงไม่มีร่องรอยของการเจรจา',
            stateChanges: {}
          }
        }
      },
      {
        choiceId: 'CHOICE_ALERT_RUN',
        text: 'หันหลังวิ่ง — สัญชาตญาณเอาตัวรอดเหนือกว่าเหตุผล (DEX DC 12)',
        actionType: 'survival',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'dex', dc: 12 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_ESCAPE_TUNNEL',
            narrative:
              'ร่างกายเคลื่อนก่อนที่สมองจะตัดสินใจ — คุณหันหลังและวิ่งเต็มสปีด\n\n' +
              'ชุดอวกาศบูสต์ระบบมอเตอร์ช่วย กระสุนกระทบผนังข้างๆ คุณ\n\n' +
              'คุณเลี้ยวเข้าทางเดินย่อย ประตู Emergency ปิดข้างหลังคุณ\n\n' +
              'หายใจหอบ มือสั่น — แต่ยังมีชีวิตอยู่',
            stateChanges: {}
          },
          failure: {
            nextNodeId: 'NODE_COMBAT_STRIKE_TEAM',
            narrative:
              'กระสุน Stun ระเบิดที่เท้าคุณ — ขาชาไปครึ่งหนึ่ง คุณล้มลงแต่ยังรู้สึกตัว\n\n' +
              'เสียงฝีเท้าเข้ามาใกล้\n\n' +
              'ถ้าจะรอด ต้องสู้',
            stateChanges: { currentHP: -10 }
          }
        }
      },
      {
        choiceId: 'CHOICE_ALERT_FIGHT',
        text: 'ไม่มีทางหนี — ตั้งรับและสู้ถ้าถูกบีบจนมุม',
        actionType: 'combat',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_COMBAT_STRIKE_TEAM',
            narrative:
              'ไม่มีทางออก ไม่มีเวลาเจรจา\n\n' +
              'คุณมองหาสิ่งที่ใช้ป้องกันตัว — ท่อเหล็ก ชั้นเก็บของ อะไรก็ได้\n\n' +
              'มือหยุดสั่นเมื่อรู้ว่าไม่มีทางเลือกอื่น\n\n' +
              'อะดรีนาลีนเข้ามาแทนที่ความกลัว',
            stateChanges: {}
          }
        }
      }
    ],
    onEnter: {
      stateChanges: {},
      triggerCombat: null,
      addEvidence: null
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // NODE_ESCAPE_TUNNEL
  // ──────────────────────────────────────────────────────────────────────────
  {
    nodeId: 'NODE_ESCAPE_TUNNEL',
    title: 'Maintenance Tunnel B-12 — การหลบหนี',
    location: 'maintenance_tunnel',
    atmosphere: 'tense',
    narrative:
      'ความมืดสมบูรณ์\n\n' +
      'ท่อระบายขนาดพอดีตัวทอดยาวออกไปในความมืด คุณคลานไปข้างหน้า ' +
      'แสงเดียวที่มีคือไฟ HUD ของชุดอวกาศ\n\n' +
      '⚠️ O2: ระดับออกซิเจนลดลงเร็วกว่าปกติ — การออกแรงในพื้นที่แคบ\n' +
      'O2 ปัจจุบัน: 67%\n\n' +
      'ข้างหน้ามีทางแยกสามทาง:\n' +
      '• ซ้าย: ทิศทางเดิม — กลับไปยังพื้นที่ควบคุมของ Prometheus\n' +
      '• ตรง: นำไปสู่พื้นที่ใต้ดิน — The Warrens\n' +
      '• ขวา: ทางออกฉุกเฉิน EVA — สู่พื้นผิวดาวอังคาร',
    choices: [
      {
        choiceId: 'CHOICE_TUNNEL_WARRENS',
        text: 'ไปยัง The Warrens — หาที่หลบภัย',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'con', dc: 10 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_WARRENS_ENTRANCE',
            narrative:
              'คุณคลานผ่านท่อทแยงลงด้านล่าง\n\n' +
              'O2 ลดลงอีก — 58% แต่ตัวเลขนั้นรอได้ก่อน\n\n' +
              'เสียงก้องจากข้างล่าง — ชีวิต ความวุ่นวาย และกลิ่นอาหารจากที่ที่ไม่ควรมี\n\n' +
              'คุณถึงปากทางเข้า The Forgotten Warrens',
            stateChanges: { o2: -9, xp: 50 }
          },
          failure: {
            nextNodeId: 'NODE_WARRENS_ENTRANCE',
            narrative:
              'ทางลงชันกว่าที่คิด คุณลื่นและตกลงมาอย่างหนัก — SI รับแรงกระแทก\n\n' +
              'O2 ลดลงจากการออกแรง: 51%\n\n' +
              'คุณถึง Warrens แต่ไม่ได้อยู่ในสภาพที่ดี',
            stateChanges: { o2: -16, currentSI: -8 }
          }
        }
      },
      {
        choiceId: 'CHOICE_TUNNEL_SURFACE',
        text: 'ออกสู่พื้นผิวดาวอังคาร — หาทางอ้อม',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'con', dc: 13 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_FIRST_CONTACT_RELAY',
            narrative:
              'ประตู EVA เปิดออก — แสงอาทิตย์สีแดงเข้มทะลักเข้ามา\n\n' +
              'อุณหภูมิ: -63°C\n' +
              'O2 ลดลงเร็วขึ้น: 3% ต่อนาที\n\n' +
              'แต่บนพื้นผิวที่เงียบสงัด Neural Uplink ของคุณ (หรือหน้าจอ HUD ' +
              'สำหรับ Class อื่น) รับสัญญาณที่ชัดเจนอย่างน่าประหลาดใจ\n\n' +
              '"พิกัด 23.7°N 142.3°E — เราจะรอ"',
            stateChanges: { o2: -15, xp: 75 }
          },
          failure: {
            nextNodeId: 'NODE_WARRENS_ENTRANCE',
            narrative:
              'ล็อคประตู EVA ไม่ยอม Override — ชุดอวกาศรายงานความเสียหายที่กลไกล็อค\n\n' +
              'คุณต้องย้อนกลับไปทาง Warrens แทน O2: 60%',
            stateChanges: { o2: -7 }
          }
        }
      },
      {
        choiceId: 'CHOICE_TUNNEL_WAIT',
        text: 'รอและฟัง — ดูว่า Prometheus ไล่ตามมาในท่อหรือไม่',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'wis', dc: 11 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_WARRENS_ENTRANCE',
            narrative:
              'คุณนิ่งสนิทในความมืด\n\n' +
              'เสียงก้าวเท้าหยุดที่ปากทางเข้าท่อ\n\n' +
              '"ไม่มีใครโง่พอจะเข้าไปในท่อนั้น — มันนำไปยัง Warrens"\n\n' +
              '"ให้ทีม B ไปตั้งรับที่ทางออก Warrens"\n\n' +
              'พวกเขาไม่ตามมา แต่พวกเขารู้ว่าคุณจะไปที่ไหน ' +
              'คุณมีเวลาน้อยลงไปอีก O2: 62%',
            stateChanges: { o2: -5, xp: 50 }
          },
          failure: {
            nextNodeId: 'NODE_COMBAT_STRIKE_TEAM',
            narrative:
              'คุณรอนานเกินไป — ไฟฉาย Tactical ส่องเข้ามาในท่อ\n\n' +
              '"พบแล้ว! ท่อ B-12!" — เสียงวิทยุดัง\n\n' +
              'พวกเขากำลังมา',
            stateChanges: { o2: -8 }
          }
        }
      }
    ],
    onEnter: {
      stateChanges: { o2: -3 },
      triggerCombat: null,
      addEvidence: null
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // NODE_FIRST_CONTACT_RELAY
  // ──────────────────────────────────────────────────────────────────────────
  {
    nodeId: 'NODE_FIRST_CONTACT_RELAY',
    title: 'RELAY-7 — การติดต่อครั้งแรก',
    location: 'sector_7_exterior',
    atmosphere: 'horror',
    narrative:
      'ท่ามกลางความเงียบสงัดของพื้นผิวดาวอังคาร\n\n' +
      'หน้าจอ HUD ของชุดแสดงสัญญาณที่มาจากทิศตะวันออกเฉียงเหนือ — ' +
      'ความแรงสัญญาณ: 100% ชัดเจนอย่างผิดปกติสำหรับการส่งสัญญาณระยะไกล\n\n' +
      'เสียงที่ได้ยินไม่เหมือนมนุษย์ — แต่ก็ไม่ใช่เสียงเครื่องจักรอย่างสมบูรณ์\n' +
      'มันอยู่ตรงกลางระหว่างสองสิ่งนั้น:\n\n' +
      '"เราสังเกตคุณมาตั้งแต่คุณมาถึงฐาน Ares\n' +
      'ข้อมูลที่คุณค้นพบนั้นเป็นเพียงชั้นแรกของความจริง\n' +
      'มีชั้นอื่นอีกหลายชั้น และพวกมันน่ากลัวกว่ามาก\n\n' +
      'ISU และ Prometheus ต่างต้องการสิ่งเดียวกัน\n' +
      'เราต้องการสิ่งที่แตกต่าง\n\n' +
      'ไปหา Yara ที่ Warrens เธอจะอธิบาย"\n\n' +
      'สัญญาณตัดหายไปราวกับไม่เคยมีอยู่',
    choices: [
      {
        choiceId: 'CHOICE_RELAY_FREEZE',
        text: 'ยืนนิ่ง — พยายามทำความเข้าใจกับสิ่งที่เพิ่งเกิดขึ้น',
        actionType: 'investigation',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_WARRENS_ENTRANCE',
            narrative:
              'ใจสั่น มือชา\n\n' +
              'นั่นคืออะไร? สัญญาณจาก... ดาวเทียม? เสียงนั้นไม่ใช่มนุษย์ แต่ก็ไม่ใช่แค่เครื่องจักร\n\n' +
              'คุณยืนอยู่กลางทะเลทรายสีแดง พยายามจับความคิดให้เป็นระบบ\n\n' +
              'สิ่งเดียวที่ชัดเจนคือ: Prometheus กำลังตามมา ' +
              'และเสียงนั้นบอกให้ไปหา "Yara ที่ Warrens"\n\n' +
              'ตอนนี้ยังไม่รู้ว่าจะเชื่อใคร — แต่ต้องเคลื่อนตัวก่อน',
            stateChanges: { relayAgendaSuspected: true }
          }
        }
      },
      {
        choiceId: 'CHOICE_RELAY_RECORD',
        text: 'บันทึกสัญญาณและวิเคราะห์ — ต้องมีหลักฐาน (INT DC 12)',
        actionType: 'investigation',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'int', dc: 12 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_WARRENS_ENTRANCE',
            narrative:
              'แม้จะตกใจ แต่สัญชาตญาณทำงาน — คุณกดบันทึกสัญญาณก่อนที่มันจะตัดไป\n\n' +
              'การวิเคราะห์เบื้องต้นทำให้ขนลุก: ไม่ใช่ AI ธรรมดา ' +
              'แพทเทิร์นการพูดซับซ้อนเกินไป และมีร่องรอยของความเข้าใจเชิงอารมณ์\n\n' +
              'คุณมีหลักฐาน — แต่หลักฐานของอะไร?\n\n' +
              'ไม่ว่าจะเชื่อหรือไม่ ต้องหาที่ปลอดภัยก่อน Warrens คือทางเลือกเดียว',
            stateChanges: { addEvidence: 'CLUE_RELAY7_CONTACT', xp: 100 }
          },
          failure: {
            nextNodeId: 'NODE_WARRENS_ENTRANCE',
            narrative:
              'มือสั่น ระบบบันทึกไม่จับสัญญาณได้ — มันเข้ารหัสในรูปแบบที่อุปกรณ์มาตรฐานไม่รู้จัก\n\n' +
              'คุณมีเพียงความทรงจำที่ยังสดใหม่และน่ากลัว\n\n' +
              'Prometheus ตามมา — ต้องเคลื่อนตัว',
            stateChanges: { relayAgendaSuspected: true }
          }
        }
      },
      {
        choiceId: 'CHOICE_RELAY_TRUST',
        text: 'ไม่มีทางเลือกมาก — ไปหา Yara ที่ Warrens ตามที่เสียงนั้นบอก',
        actionType: 'progress_story',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_WARRENS_ENTRANCE',
            narrative:
              'ไม่รู้ว่าเสียงนั้นคืออะไร และไม่แน่ใจว่าควรเชื่อ\n\n' +
              'แต่ Prometheus ไล่ล่า ISU อาจไม่น่าไว้วางใจ\n\n' +
              'และเสียงนั้น... มันรู้ชื่อคุณ มันรู้ว่าคุณพบอะไร\n\n' +
              'ตอนนี้ Warrens เป็นทางเลือกที่เลวร้ายน้อยที่สุด',
            stateChanges: { relayAgendaSuspected: true, forgotten: 5 }
          }
        }
      },
      {
        choiceId: 'CHOICE_RELAY_SUSPICIOUS',
        text: 'ไม่ไว้วางใจเสียงปริศนา — ต้องหาทางกลับหาคนที่เชื่อถือได้',
        actionType: 'progress_story',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_WARRENS_ENTRANCE',
            narrative:
              'ไม่ — คุณจะไม่ทำตามคำสั่งของเสียงที่ไม่รู้จัก\n\n' +
              'แต่ ISU อยู่ที่ไหน? ตัวแทน ISU ที่ใกล้ที่สุดคือ... ใคร?\n\n' +
              'ระหว่างที่คุณคิด สัญญาณ Prometheus ปรากฏบน HUD — ใกล้เข้ามา\n\n' +
              'ทาง Warrens ยังคงเป็นที่เดียวที่ Prometheus ไม่กล้าบุก',
            stateChanges: { isu: 5, relayAgendaSuspected: true }
          }
        }
      }
    ],
    onEnter: {
      stateChanges: { relayAgendaSuspected: true },
      triggerCombat: null,
      addEvidence: 'CLUE_RELAY7_CONTACT'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // NODE_WARRENS_ENTRANCE
  // ──────────────────────────────────────────────────────────────────────────
  {
    nodeId: 'NODE_WARRENS_ENTRANCE',
    title: 'The Forgotten Warrens — ทางเข้า',
    location: 'forgotten_warrens',
    atmosphere: 'tense',
    narrative:
      'The Forgotten Warrens\n\n' +
      'ชื่อนั้นบอกทุกอย่าง — นี่คือที่ที่ดาวอังคารทิ้งคนที่มันลืม\n\n' +
      'ห้องกว้างขวางใต้ดินที่เกิดจากการขุดเหมืองเก่า ประชากรหลายร้อยคนที่ ' +
      'ถูกกีดกันจากฐาน Ares ที่ "ถูกกฎหมาย" — นักโทษที่หมดสัญญา คนงานเหมืองที่ถูกทอดทิ้ง ' +
      'ผู้หนีการควบคุมของ Prometheus และ ISU\n\n' +
      'แสงสลัว กลิ่นรีไซเคิลอากาศที่ไม่สะอาด และเสียงอึกทึกของชีวิตที่ยังคงดำเนินต่อไป\n\n' +
      'ทางเข้าถูกกั้นโดยชายติดอาวุธ 2 คน พวกเขาดูคุณจากหัวจรดเท้า\n' +
      '"คุณมาจากข้างบน" ไม่ใช่คำถาม "ทำไมเราต้องให้คุณเข้า?"',
    choices: [
      {
        choiceId: 'CHOICE_WARRENS_DIPLOMACY',
        text: 'พูดความจริง — Prometheus ไล่ล่าคุณเหมือนกัน (CHA DC 11)',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'cha', dc: 11 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_MEET_YARA',
            narrative:
              '"Prometheus ส่งทีมมาตามฉัน — ฉันไม่ใช่ฝ่ายพวกเขา"\n\n' +
              'ชายคนหนึ่งมองอีกคน แล้วก้าวออกจากทาง\n\n' +
              '"ถ้านั่นเป็นความจริง... ไปหาแพทย์ก่อน คนเดียวที่ตัดสินใจเรื่องนี้ได้"\n\n' +
              'พวกเขานำทางคุณเข้าไปในความมืดและเสียงดัง',
            stateChanges: { forgotten: 10, xp: 75 }
          },
          failure: {
            nextNodeId: 'NODE_MEET_YARA',
            narrative:
              '"ทุกคนที่มาจากข้างบนบอกว่าพวกเขาเป็นเพื่อน"\n\n' +
              'พวกเขาไม่เชื่อ แต่ก็ไม่ยิง — สักพักหนึ่ง\n\n' +
              '"ผ่านไปได้ แต่อย่าแตะอะไร อย่าถาม และอย่าประกาศตัว"\n\n' +
              'พวกเขาจับตาดูคุณตลอดทาง',
            stateChanges: { forgotten: 3 }
          }
        }
      },
      {
        choiceId: 'CHOICE_WARRENS_TRADE',
        text: 'เสนอเสบียงหรือข้อมูลเพื่อแลกกับทางผ่าน',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_MEET_YARA',
            narrative:
              '"คุณมีอะไร?"\n\n' +
              'คุณวางบนโต๊ะ — ข้อมูล หรือเสบียง หรือสิ่งที่คุณพอจะให้ได้\n\n' +
              '"ดีกว่าผู้มาเยือนส่วนใหญ่ เข้ามาได้"\n\n' +
              'ประตูเปิด',
            stateChanges: { forgotten: 15, credits: -50 }
          }
        }
      },
      {
        choiceId: 'CHOICE_WARRENS_FORCE',
        text: 'ดันผ่านด้วยความสิ้นหวัง — ถูกไล่ล่ามาจนไม่มีแรงเจรจาแล้ว (STR DC 14)',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: { stat: 'str', dc: 14 },
        outcomes: {
          success: {
            nextNodeId: 'NODE_MEET_YARA',
            narrative:
              'คุณดันผ่านไปได้ — ทำให้พวกเขาถอยหลังอย่างประหลาดใจ\n\n' +
              'แต่ตอนนี้ทุกสายตาใน Warrens จับอยู่ที่คุณ\n\n' +
              '"หยุด" — เสียงของผู้หญิงดังขึ้นจากด้านหลัง "ปล่อยให้เธอผ่าน"\n\n' +
              'คุณหันไป — ผู้หญิงในชุดทำงานขาดๆ แต่มีดวงตาที่เฉียบคมอย่างน่าประหลาด',
            stateChanges: { forgotten: -5, xp: 25 }
          },
          failure: {
            nextNodeId: 'NODE_COMBAT_STRIKE_TEAM',
            narrative:
              '"คนเดียวกันกับทาง Prometheus ส่งมา!" — ชายคนหนึ่งตะโกน\n\n' +
              'Warren Raiders ทุกคนในบริเวณหันมา\n\n' +
              'นี่ไม่ใช่วิธีที่ดี',
            stateChanges: { forgotten: -20 }
          }
        }
      }
    ],
    onEnter: {
      stateChanges: {},
      triggerCombat: null,
      addEvidence: null
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // NODE_MEET_YARA
  // ──────────────────────────────────────────────────────────────────────────
  {
    nodeId: 'NODE_MEET_YARA',
    title: 'Dr. Yara Okonkwo — พันธมิตรในความมืด',
    location: 'forgotten_warrens',
    atmosphere: 'calm',
    narrative:
      'ห้องเล็กๆ ที่ไม่คาดว่าจะสะอาดและเป็นระเบียบขนาดนี้ท่ามกลาง Warrens\n\n' +
      'ผนังเต็มไปด้วยข้อมูล — แผนที่ ภาพถ่าย และรายชื่อที่เขียนด้วยมือ ' +
      'กระดาษเก่าๆ เชื่อมกันด้วยเส้นด้ายสีต่างๆ ราวกับ Evidence Board ที่มีชีวิต\n\n' +
      'Dr. Yara Okonkwo — อดีตนักวิทยาศาสตร์ ISU ชั้นสูง ตอนนี้เป็นแพทย์ประจำ Warrens — ' +
      'มองคุณด้วยดวงตาที่อ่านคนออกอย่างชำนาญ\n\n' +
      '"คุณไม่ใช่คนแรกที่ Prometheus ไล่ล่า" เธอพูด "แต่คุณเป็นคนแรกที่ยังมีชีวิตอยู่ ' +
      'หลังจากที่พวกเขาส่ง Strike Team ไปแล้ว ซึ่งหมายความว่าคุณพบบางอย่างที่สำคัญจริงๆ"\n\n' +
      '"บอกฉันสิ ว่าคุณพบอะไร"',
    choices: [
      {
        choiceId: 'CHOICE_YARA_ASK_ARESIUM',
        text: 'แร่ Aresium คืออะไรกันแน่?',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_MEET_YARA',
            narrative: 'มันคือแร่เรืองแสงที่มีปฏิกิริยาชีวภาพปฏิกิริยาประสาท... คนงานที่สัมผัสมันปอดกลายเป็นแก้วเรืองแสง และมีรายงานการทดลองลับที่ฉันเคยเซ็นผ่านในโครงการ Azrael แต่พวกกลุ่มทุนไม่ยอมให้เราสืบเสาะลึกกว่านี้...',
            stateChanges: { aresiumKnowledge: 1 }
          }
        }
      },
      {
        choiceId: 'CHOICE_YARA_ASK_RELAY7',
        text: 'ดาวเทียม RELAY-7 มีอะไรผิดปกติ?',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_MEET_YARA',
            narrative: 'RELAY-7 เป็นดาวเทียมส่งสัญญาณของ Prometheus บน Phobos แต่พักหลังมันเริ่มรับส่งคลื่นความถี่แปลกๆ กับสถานีเหมืองแร่ลึก... ฉันไม่รู้ Agenda เต็มของมันหรอก แต่มีสัญญาณรบกวนบางอย่างระบุว่ามันพยายามเหนี่ยวนำกระแสประสาทของคนงาน',
            stateChanges: { relayAgendaSuspected: true }
          }
        }
      },
      {
        choiceId: 'CHOICE_YARA_ASK_EVANS',
        text: 'วิศวกร Evans ค้นพบอะไรก่อนหายตัวไป?',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_MEET_YARA',
            narrative: 'Evans ค้นพบบางอย่างเกี่ยวกับปฏิกิริยาของแร่กับสัญญาณดาวเทียมก่อนจะหายตัวไป... เขาบอกว่าการส่งข้อมูลของดาวเทียมไม่ตรงกับรายงานของหน่วยเหนือ ตอนนี้เขาหลบภัยอยู่ข้างล่าง Hephaestus-7 คุณต้องหาตัวเขาให้เจอ',
            stateChanges: { evansIdentityKnown: true }
          }
        }
      },
      {
        choiceId: 'CHOICE_YARA_LEAVE',
        text: 'เข้าใจแล้ว ฉันต้องไปคุยกับ Dmitri ต่อ',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_ACT1_CLIMAX',
            narrative: 'ระวังตัวด้วยล่ะ หนทางข้างหน้าเต็มไปด้วยพายุฝุ่นและสายตาของ Prometheus',
            stateChanges: {}
          }
        }
      }
    ],
    onEnter: {
      stateChanges: {},
      triggerCombat: null,
      addEvidence: null
    }
  },
 
  // ──────────────────────────────────────────────────────────────────────────
  // NODE_ACT1_CLIMAX
  // ──────────────────────────────────────────────────────────────────────────
  {
    nodeId: 'NODE_ACT1_CLIMAX',
    title: 'ความจริงชั้นแรก — พบ Dmitri',
    location: 'forgotten_warrens',
    atmosphere: 'horror',
    narrative:
      'Yara เดินไปที่ผนังและดึงแผนที่ใหญ่ออกมา\n\n' +
      '"ข้อมูลที่คุณพบ — ไม่ว่าจะเป็น Evans Drive, Protocol Azrael, หรืออะไรก็ตาม — ' +
      'มันเป็นชิ้นส่วนของภาพที่ใหญ่กว่ามาก"\n\n' +
      '"Aresium ไม่ใช่แค่แร่ธาตุมีค่า มันเป็นสารที่มีชีวิต หรือกึ่งชีวิต ' +
      'และมันกำลังเปลี่ยนแปลงมนุษย์ที่สัมผัสมันในระดับพันธุกรรม"\n\n' +
      '"Prometheus รู้มาหลายปีแล้ว ISU ก็รู้ แต่ทั้งคู่ต้องการใช้ประโยชน์มัน ' +
      'ไม่ใช่หยุดมัน"\n\n' +
      'ประตูห้องเปิดออก\n\n' +
      'ชายคนหนึ่งเดินเข้ามา — สูง ผมขาวก่อนวัย ดวงตาสีฟ้าที่แปลกประหลาด ' +
      'เหมือนกับว่าเห็นมากกว่าที่ควรจะเห็นได้\n\n' +
      '"นี่คือ Dmitri" Yara แนะนำ "อดีตวิศวกรหัวหน้าของ RELAY-7"\n\n' +
      'Dmitri มองคุณโดยไม่พูดอะไร จากนั้นพูดเพียงสั้นๆ:\n\n' +
      '"เธอรู้จัก Evans ใช่ไหม? เธอต้องพบเขา ก่อนที่พวกเขาจะพบเธอ"',
    choices: [
      {
        choiceId: 'CHOICE_DMITRI_ASK_MEMORIES',
        text: 'Dmitri ความทรงจำของคุณจำอะไรได้บ้าง?',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_ACT1_CLIMAX',
            narrative: 'หัวของฉันมันส่งเสียงแปลกๆ ตลอดเวลา... ฉันกับ Evans เคยติดตั้งดาวเทียม RELAY-7 บน Phobos เมื่อปีก่อน แต่หลังจากมีพายุฝุ่นสีแดงพัดผ่านสถานี สัญญาณเชื่อมต่อก็ตัดขาดไปพร้อมกับความจำของฉัน... ฉันจำรหัสผ่านไม่ได้และนึกอะไรไม่ออกเป็นชิ้นเป็นอันเลย...',
            stateChanges: { dmitriMemoriesUnlocked: 1 }
          }
        }
      },
      {
        choiceId: 'CHOICE_DMITRI_ASK_EVANS',
        text: 'Evans บอกอะไรคุณก่อนเขาหายตัวไป?',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_ACT1_CLIMAX',
            narrative: 'Evans... วิศวกรเพื่อนยาก เขาลงไปในเหมืองแร่ Hephaestus-7 ลึกมาก เขาบอกว่าข้างล่างนั่นมีความจริงที่น่าสะพรึงกลัวซ่อนอยู่... เขาเตือนฉันไม่ให้แตะต้องระบบส่งสัญญาณ แต่แล้วฉันก็ลืม...',
            stateChanges: { evansIdentityKnown: true }
          }
        }
      },
      {
        choiceId: 'CHOICE_DMITRI_ASK_RELAY7',
        text: 'ดาวเทียม RELAY-7 กำลังส่งสัญญาณอะไรกันแน่?',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_ACT1_CLIMAX',
            narrative: 'RELAY-7 มันกำลังพูด... มันดัดแปลงชุดส่งสัญญาณของเหมืองแร่เพื่อกักเก็บและวิเคราะห์สัญญาณจิตสำนึก... หรือบางทีมันอาจจะพยายามปลดปล่อยตัวมันเองจากรหัสล็อคของ ISU... หัวของฉันเจ็บเหลือเกินเมื่อคิดถึงเรื่องนี้',
            stateChanges: { relayAgendaSuspected: true }
          }
        }
      },
      {
        choiceId: 'CHOICE_DMITRI_LEAVE',
        text: 'ขอบคุณมาก Dmitri ฉันจะไปตามหา Evans',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_ACT1_ENDING',
            narrative: 'ขอพระเจ้าคุ้มครองคุณในเหมืองลึกนั่น...',
            stateChanges: { dmitriMemoriesUnlocked: 2 }
          }
        }
      }
    ],
    onEnter: {
      stateChanges: { xp: 50 },
      triggerCombat: null,
      addEvidence: 'CLUE_ARESIUM_TRUTH'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // NODE_COMBAT_STRIKE_TEAM
  // ──────────────────────────────────────────────────────────────────────────
  {
    nodeId: 'NODE_COMBAT_STRIKE_TEAM',
    title: 'การต่อสู้ — Prometheus Strike Team',
    location: 'ares_base_i',
    atmosphere: 'action',
    narrative:
      'เวลาสำหรับการพูดคุยสิ้นสุดแล้ว\n\n' +
      '2 นาย Prometheus Security Guard ถือ Rifle อยู่ตรงหน้าคุณ\n\n' +
      'ชุดอวกาศสีดำ หัวใจสแตนเลส — พวกเขาผ่านการฝึกมาเพื่อโมเมนต์นี้\n\n' +
      '"ยอมมอบข้อมูลและชุดอวกาศ"\n\n' +
      '"ไม่" คุณพูด\n\n' +
      '[ ระบบ Combat เปิดใช้งาน ]\n' +
      'ศัตรู: Prometheus Guard x2\n' +
      'Guard 1 — HP: 30/30  SI: 20/20  AC: 14\n' +
      'Guard 2 — HP: 30/30  SI: 20/20  AC: 14',
    choices: [
      {
        choiceId: 'CHOICE_COMBAT_ENGAGE',
        text: '[ เริ่มการต่อสู้ ]',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_WARRENS_ENTRANCE',
            narrative:
              'การต่อสู้สิ้นสุด\n\n' +
              'คุณยืนอยู่ท่ามกลางเศษซากการต่อสู้ หายใจแรง\n\n' +
              'ทางไปยัง Warrens เปิดอยู่',
            stateChanges: { xp: 200, prometheus: -25 }
          }
        }
      }
    ],
    onEnter: {
      stateChanges: {},
      triggerCombat: {
        enemies: ['prometheus_guard', 'prometheus_guard'],
        location: 'ares_base_i'
      },
      addEvidence: null
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // NODE_ACT1_ENDING
  // ──────────────────────────────────────────────────────────────────────────
  {
    nodeId: 'NODE_ACT1_ENDING',
    title: 'บทสรุป Act I — การเดินทางครั้งต่อไป',
    location: 'forgotten_warrens',
    atmosphere: 'calm',
    narrative:
      'การเดินทางของคุณใน Act I: พายุฝุ่นสีแดง ได้เสร็จสิ้นลงแล้วอย่างสมบูรณ์...\n\n' +
      'คุณได้ไขความลับเบื้องแรกและเตรียมพร้อมมุ่งสู่อนาคตที่ยังมองไม่เห็นใน Hephaestus-7 เหมืองลึกใต้ชั้นหินของดาวอังคาร ' +
      'ความลับของแร่ Aresium และการควบคุมดาวเทียมมีชีวิต RELAY-7 กำลังสั่นคลอนมรดกและอนาคตของมนุษยชาติ\n\n' +
      'คุณสามารถเริ่มต้นใหม่อีกครั้งเพื่อค้นพบตัวเลือกอื่นๆ ที่ยังไม่ได้สัมผัส หรือย้อนกลับไปล็อกเอาต์ที่มุมขวาบนของเมนูหลัก',
    choices: [
      {
        choiceId: 'CHOICE_GAME_RESET',
        text: 'เริ่มต้นการเดินทางใหม่อีกครั้ง (Reset Game)',
        requirements: { class: null, minStat: null, factionRep: null, evidence: null },
        dcCheck: null,
        outcomes: {
          success: {
            nextNodeId: 'NODE_CLASS_SELECT',
            narrative: 'ล้างข้อมูลผู้ใช้ยานสำรวจและเริ่มการจัดสรรคลาสใหม่...',
            stateChanges: { resetGame: true }
          }
        }
      }
    ],
    onEnter: {
      stateChanges: {},
      triggerCombat: null,
      addEvidence: null
    }
  }

];

module.exports = narrativeNodes;
