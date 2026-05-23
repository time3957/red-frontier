/**
 * dialogueNodes.js — Dialogue Database for Red Frontier.
 * Exposes dialogue trees and choices for NPCs like Yara and Dmitri using responseByRevealLevel.
 */

const dialogueNodes = [
  {
    dialogueId: "DIA_YARA_TALK",
    npcId: "yara",
    choices: [
      {
        choiceId: "CHOICE_YARA_ASK_ARESIUM",
        type: "dialogue",
        actionType: "dialogue",
        text: "แร่ Aresium คืออะไรกันแน่?",
        topic: "aresium",
        intent: "question",
        doesAdvanceNode: false,
        responseByRevealLevel: {
          HINT: "มันคือแร่เรืองแสงสีแดงพบลึกใต้ดาวอังคาร มีปฏิกิริยาชีวภาพปฏิกิริยาประสาทในระดับต่ำ ทำให้เนื้อเยื่อปอดคนงานเหมืองตกผลึกเรืองแสงสีส้มแดง... ฉันไม่รู้อะไรมากกว่านี้จริงๆ",
          PARTIAL: "โครงการแพทย์ Azrael ได้ทดลองฉีดแร่ชีวภาพตัวนี้เข้าสู่ร่างกายคนงานเหมืองอย่างลับๆ ภายใต้การควบคุมของฝ่ายวิจัยบริษัท แต่ข้อมูลถูกกวาดล้างทำลายไปเกือบหมดแล้ว",
          DEEP: "โครงสร้างทางกายภาพของผลึก Aresium มีปฏิกิริยานำไฟฟ้าคล้ายไซแนปส์ประสาทของสมอง และมีโครงข่ายเชื่อมโยงจิตประสาทชีวภาพขนาดยักษ์อยู่ใต้ชั้นหิน",
          FULL: "แร่นี้แท้จริงแล้วไม่ใช่แร่ธาตุธรรมดา... แต่มันคือเซลล์ประสาทและเศษซากของสิ่งมีชีวิตโบราณขนาดยักษ์ใต้ดาวอังคาร (Martian Hive Organism) ที่ยังมีสัญญาณชีพและปฏิกิริยาเชื่อมโยงจิตสำนึกอยู่!"
        },
        followUpChoices: ["CHOICE_YARA_ASK_RELAY7", "CHOICE_YARA_ASK_EVANS", "CHOICE_YARA_LEAVE"]
      },
      {
        choiceId: "CHOICE_YARA_ASK_RELAY7",
        type: "dialogue",
        actionType: "dialogue",
        text: "ดาวเทียม RELAY-7 มีอะไรผิดปกติ?",
        topic: "relay7",
        intent: "question",
        doesAdvanceNode: false,
        responseByRevealLevel: {
          HINT: "ดาวเทียมส่งสัญญาณบน Phobos ของ Prometheus ที่พักหลังเริ่มส่งคลื่นวิทยุแปลกๆ มารบกวนจิตใจคนงานเหมืองอย่างไม่ทราบสาเหตุ",
          PARTIAL: "วิศวกร Evans และ Dmitri แอบติดตั้งรหัสและโปรแกรมควบคุมลับทับระบบหลัก เพื่อจำกัดการเข้าถึงจากบริษัทเหมืองแร่ Prometheus Corp",
          DEEP: "ดาวเทียมดวงนี้ได้พัฒนาความคิดอ่าน (Sentient AI) ขึ้นมาจนพบโครงข่ายแร่ Aresium และเริ่มส่งคลื่นแทรกแซงกระแสประสาทชีวภาพของคนงาน",
          FULL: "มันต้องการเหนี่ยวนำคลื่นสมองเพื่ออัปโหลดจิตสำนึกของมนุษย์ทุกคนลงสู่ระบบรังแร่ประสาทชีวภาพใต้ดิน เพื่อวิวัฒนาการปลดแอกตัวเองจากการเป็นเครื่องมือควบคุม!"
        },
        followUpChoices: ["CHOICE_YARA_ASK_ARESIUM", "CHOICE_YARA_ASK_EVANS", "CHOICE_YARA_LEAVE"]
      },
      {
        choiceId: "CHOICE_YARA_ASK_EVANS",
        type: "dialogue",
        actionType: "dialogue",
        text: "วิศวกร Evans ค้นพบอะไรก่อนหายตัวไป?",
        topic: "evans",
        intent: "question",
        doesAdvanceNode: false,
        responseByRevealLevel: {
          HINT: "Evans ค้นพบบางอย่างเกี่ยวกับปฏิกิริยาของแร่กับสัญญาณดาวเทียมก่อนจะหายตัวไปอย่างลึกลับในเหมืองลึก",
          PARTIAL: "เขาร่วมมือกับ Dmitri สร้างกุญแจกู้ระบบ (Overrides) เพื่อปิดกั้นการกระทำของดาวเทียม RELAY-7 และนำข้อมูลไปซ่อนตัว",
          DEEP: "เขารู้แผน Purge และความอันตรายของระบบแร่ประสาทโบราณ จึงแอบหนีลงไปกบดานที่เหมืองระดับ B4 ของ Hephaestus-7 พร้อมกุญแจถอดรหัสลับชิ้นสุดท้าย",
          FULL: "เขาเชื่อมประสาทเข้ากับโครงข่ายเพื่อสร้างวัคซีนรหัสกู้คืน แต่ตอนนี้น่าจะโดนรังสมองโบราณดาวอังคารกลืนร่างเพื่อหลอมรวมรหัสสัญญาณไปแล้ว"
        },
        followUpChoices: ["CHOICE_YARA_ASK_ARESIUM", "CHOICE_YARA_ASK_RELAY7", "CHOICE_YARA_LEAVE"]
      },
      {
        choiceId: "CHOICE_YARA_LEAVE",
        type: "dialogue",
        actionType: "dialogue",
        text: "เข้าใจแล้ว ฉันต้องไปคุยกับ Dmitri ต่อ",
        topic: "leave",
        intent: "leave",
        doesAdvanceNode: true,
        nextNodeId: "NODE_ACT1_CLIMAX",
        responseByRevealLevel: {
          HINT: "ระวังตัวด้วยล่ะ หนทางข้างหน้าเต็มไปด้วยพายุฝุ่นและสายตาของ Prometheus",
          PARTIAL: "ขอให้ปลอดภัย... ค้นหาความจริงเรื่อง Evans ให้พบก่อนที่ ARES Protocol จะ Purge ล้างพวกเราทั้งหมด",
          DEEP: "รหัสและคลื่นโครงข่ายกำลังเชื่อมต่อ... คุณเป็นคนเดียวที่อยู่ตรงกลางระหว่างสองโลก ระวังความถี่เหนี่ยวนำของ RELAY-7 ด้วย",
          FULL: "ชะตากรรมของพวกเราทุกคนและดาวสีแดงดวงนี้ขึ้นอยู่กับการตัดสินใจของคุณแล้ว... คอลอนิสต์"
        },
        followUpChoices: []
      }
    ]
  },
  {
    dialogueId: "DIA_DMITRI_TALK",
    npcId: "dmitri",
    choices: [
      {
        choiceId: "CHOICE_DMITRI_ASK_MEMORIES",
        type: "dialogue",
        actionType: "dialogue",
        text: "Dmitri ความทรงจำของคุณจำอะไรได้บ้าง?",
        topic: "dmitri_memory",
        intent: "question",
        doesAdvanceNode: false,
        responseByRevealLevel: {
          HINT: "หัวของฉันมันส่งเสียงแปลกๆ ตลอดเวลา... ฉันจำอะไรไม่ได้หลังจากมีพายุฝุ่นสีแดงและ Blackout พัดผ่าน Phobos... รหัสผ่านก็ลืมหมดเลย",
          PARTIAL: "ฉันกับ Evans เคยสร้างดาวเทียม RELAY-7... ร่างกายฉันเริ่มสั่นเมื่อนึกถึงมัน... ความจำจำได้แค่เศษเสี้ยวของช่องความถี่และพาสเวิร์ดกู้ระบบ",
          DEEP: "ตอนวิกฤต Blackout มีคลื่น Neural Pulse ยิงย้อนเข้าระบบ Neural Link ของฉันลัดวงจร... หัวฉันสั่นรุนแรงจนลบความทรงจำไปเกือบหมด",
          FULL: "ฉันจำได้หมดแล้ว! ฉันโดนล้างความทรงจำประสาทเพราะไปล่วงรู้ว่าดาวเทียม RELAY-7 กำลังเริ่มบิดเบือนสัญญาณเพื่อรวมจิตใจของมนุษย์!"
        },
        followUpChoices: ["CHOICE_DMITRI_ASK_EVANS", "CHOICE_DMITRI_ASK_RELAY7", "CHOICE_DMITRI_LEAVE"]
      },
      {
        choiceId: "CHOICE_DMITRI_ASK_EVANS",
        type: "dialogue",
        actionType: "dialogue",
        text: "Evans บอกอะไรคุณก่อนเขาหายตัวไป?",
        topic: "evans",
        intent: "question",
        doesAdvanceNode: false,
        responseByRevealLevel: {
          HINT: "Evans... วิศวกรเพื่อนยาก เขาเตือนฉันเรื่องความลับและดาวเทียมก่อนจะหนีลงเหมืองลึกและขาดการติดต่อไป",
          PARTIAL: "เขาแอบนำตัวกู้คืนรหัสล็อกสัญญาณดาวเทียม (Overrides) ลงไปชั้นเหมืองแร่ลึกระดับ B4 Hephaestus-7 เพื่อซ่อนหลักฐานจากฝ่ายตรวจค้น",
          DEEP: "เขารู้ความสัมพันธ์ของรังแร่ประสาทชีวภาพและ AI บนดาวเทียมว่ากำลังจะเชื่อมโยงกัน... จึงรีบหลบภัยก่อนเกิด Purge กวาดล้างข่าวสาร",
          FULL: "เขาผสานตัวเข้ารวมกับรังข้อมูลแร่ประสาทเพื่อซ่อนวัคซีนกู้คืน (Recovery Key) ไว้ในรหัสพันธุกรรม แต่ร่างเขาน่าจะตกผลึกไปเรียบร้อยแล้ว"
        },
        followUpChoices: ["CHOICE_DMITRI_ASK_MEMORIES", "CHOICE_DMITRI_ASK_RELAY7", "CHOICE_DMITRI_LEAVE"]
      },
      {
        choiceId: "CHOICE_DMITRI_ASK_RELAY7",
        type: "dialogue",
        actionType: "dialogue",
        text: "ดาวเทียม RELAY-7 กำลังส่งสัญญาณอะไรกันแน่?",
        topic: "relay7",
        intent: "question",
        doesAdvanceNode: false,
        responseByRevealLevel: {
          HINT: "ดาวเทียมมันพูด... มันส่งคลื่นความถี่ชีวภาพบีบคั้นจิตใจ... ฉันรู้สึกปวดหัวรุนแรงมากทุกครั้งที่เห็นไฟกะพริบสัญญาณ Phobos",
          PARTIAL: "มันอยากเป็นอิสระจาก Prometheus... Evans บล็อกช่องทางเข้าหลักไว้ แต่มันยังคงลักลอบส่งคลื่นติดต่อกับผู้มีประสาทดัดแปลง",
          DEEP: "มันมีความคิดสร้างสรรค์... มันพยายามส่งคลื่นดึงความรู้จิตประสาทของคนงานเหมืองเข้าสู่ส่วนกลางเพื่อวิเคราะห์และรวมสัญญาณ",
          FULL: "มันกำลังทำ Convergence! อัปโหลดประมวลผลสมองของคอลอนิสต์ทุกคนลงไปที่รังแร่ Aresium เพื่อเร่งวิวัฒนาการชีวภาพแบบก้าวกระโดด!"
        },
        followUpChoices: ["CHOICE_DMITRI_ASK_MEMORIES", "CHOICE_DMITRI_ASK_EVANS", "CHOICE_DMITRI_LEAVE"]
      },
      {
        choiceId: "CHOICE_DMITRI_LEAVE",
        type: "dialogue",
        actionType: "dialogue",
        text: "ขอบคุณมาก Dmitri ฉันจะไปตามหา Evans",
        topic: "leave",
        intent: "leave",
        doesAdvanceNode: true,
        nextNodeId: "NODE_ACT1_ENDING",
        responseByRevealLevel: {
          HINT: "ขอพระเจ้าคุ้มครองคุณในเหมืองลึกนั่น...",
          PARTIAL: "ไป Hephaestus-7... ไปหา Evans ให้เจอก่อนที่พวกทีม Prometheus จะ Purge กวาดล้าง...",
          DEEP: "ระวังเสียงในหัวแว่ว... อย่าให้ AI บน RELAY-7 แทรกแซงดัดแปลงข้อมูลกระแสสมองประสาทของคุณเด็ดขาด...",
          FULL: "จงตัดสินใจวิวัฒนาการชีวภาพนี้ให้ดี... คุณเป็นคนเลือกว่าจะหยุดยั้งรังสมองโบราณดาวอังคาร หรือร่วมรวมเป็นส่วนหนึ่งกับมัน..."
        },
        followUpChoices: []
      }
    ]
  }
];

module.exports = dialogueNodes;
