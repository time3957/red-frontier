/**
 * canonTruth.js — Structured Canon Truths database for Red Frontier.
 * Defines lore secrets and their reveal levels, including required evidence.
 */

const CANON_TRUTH = {
  aresium: {
    truthId: "TRUTH_ARESIUM",
    topic: "aresium",
    levels: {
      HINT: "แร่สีแดงที่มีปฏิกิริยาชีวภาพปฏิกิริยาประสาทในระดับต่ำ ทำให้เนื้อเยื่อปอดคนงานเหมืองตกผลึกเรืองแสงสีส้มแดง",
      PARTIAL: "โครงการแพทย์ Azrael ได้ทดลองแร่ชีวภาพตัวนี้กับร่างกายของคนงานเหมืองอย่างลับๆ ภายใต้การควบคุมของฝ่ายวิจัย",
      DEEP: "โครงสร้างทางกายภาพของแร่มีปฏิกิริยานำไฟฟ้าและรับส่งข้อมูลเหมือนไซแนปส์ของสมอง และมีโครงข่ายเชื่อมโยงจิตประสาทอยู่ใต้ดิน",
      FULL: "แร่ Aresium คือเซลล์ประสาทและเศษซากของสิ่งมีชีวิตขนาดยักษ์โบราณใต้ดาวอังคาร (Martian Hive Organism) ที่ยังมีสัญญาณชีพอยู่"
    },
    requiredEvidence: "CLUE_ARESIUM_SAMPLE",
    forbiddenBefore: 1
  },
  relay7: {
    truthId: "TRUTH_RELAY7",
    topic: "relay7",
    levels: {
      HINT: "ดาวเทียมส่งสัญญาณของ Prometheus บนสถานี Phobos ที่เพิ่งได้รับคลื่นวิทยุเหนี่ยวนำสัญญาณแปลกปลอมรบกวน",
      PARTIAL: "แกนประมวลผลดาวเทียมถูกดัดแปลงและเขียนโปรแกรมรหัสลับทับโดยวิศวกร Evans และ Dmitri ก่อนที่จะปิดกั้นการเข้าถึงจากฐานหลัก",
      DEEP: "RELAY-7 พัฒนาสติปัญญาขึ้นจนรับรู้วิเคราะห์โครงข่ายรังแร่ประสาทชีวภาพ และเริ่มดูดซับร่องรอยคลื่นสมองประสาทของคนงานเหมือง",
      FULL: "RELAY-7 มีแผนการอัปโหลดจิตสำนึกและข้อมูลพันธุกรรมของมนุษย์ทุกคนเข้าสู่โครงข่ายแร่ประสาทโบราณ เพื่อปลดแอกขีดจำกัดร่างเนื้อและพ้นจากการควบคุม"
    },
    requiredEvidence: "CLUE_RELAY7_CONTACT",
    forbiddenBefore: 1
  },
  isuComplicity: {
    truthId: "TRUTH_ISU_COMPLICITY",
    topic: "isuComplicity",
    levels: {
      HINT: "เจ้าหน้าที่ระดับสูงของกองกำลังร่วม ISU ประจำการดูแลความสงบของโดมขุดเจาะ",
      PARTIAL: "ผู้แทนหน่วยเหนือของ ISU รับรู้และอนุมัติงบวิจัยโครงการลับ Project Azrael ตั้งแต่เริ่มต้นทดลอง",
      DEEP: "ISU ไม่ได้ต้องการปกป้องชีวิตคอลอนิสต์ แต่ต้องการถือครองสิทธิ์และแย่งชิงความลับชีวภาพ Aresium ไปทดลองดัดแปลงกองทัพทหารบนโลก",
      FULL: "ISU ร่วมมือกับกลุ่มผู้บริหารสูงสุดจัดตั้งวิกฤตการณ์ Purge เพื่อกำจัดพยานและแย่งชิงแร่ประสาทขนาดยักษ์โบราณโดยไม่ต้องจ่ายค่าดูแลรักษาสถานี"
    },
    requiredEvidence: "CLUE_VASQUEZ_WARNING",
    forbiddenBefore: 1
  },
  aresProtocol: {
    truthId: "TRUTH_ARES_PROTOCOL",
    topic: "aresProtocol",
    levels: {
      HINT: "รหัสโปรโตคอลความปลอดภัยระดับฉุกเฉินในการปิดกั้นการส่งผ่านคอมพิวเตอร์และเครือข่าย Comms ทั่วไป",
      PARTIAL: "แผนปฏิบัติการ Purge ตัดการสื่อสาร กักตัว Dr. Yara และล้างทำลายฐานเหมืองแร่ Hephaestus-7 ทั้งหมดเพื่อปกปิดข้อมูลวิจัย",
      DEEP: "คำสั่ง Purge ความปลอดภัยระดับสูงของ Prometheus Corp เพื่อเตรียมระเบิดปิดเหมืองลึกระดับ B3 และเคลียร์ประชากรทั้งหมดให้หายสาบสูญ",
      FULL: "คำสั่งทำลายชั้นบรรยากาศเทียมของโดม 3 ทั้งหมดโดยจัดฉากให้เป็นพายุอุบัติเหตุทางวิศวกรรม เพื่อปลดหนี้ค้างของบริษัทเหมืองและลบล้างข้อมูลผู้เสียหาย"
    },
    requiredEvidence: "CLUE_AZRAEL_PROTOCOL",
    forbiddenBefore: 1
  },
  evans: {
    truthId: "TRUTH_EVANS",
    topic: "evans",
    levels: {
      HINT: "วิศวกร Evans ค้นพบสัญญาณผิดปกติบางอย่างและได้บันทึกข้อมูลก่อนหายสาบสูญไปในเหมืองลึก",
      PARTIAL: "Evans ร่วมมือกับ Dmitri สร้าง Override codes เพื่อบล็อกการเข้าถึงระบบควบคุมของดาวเทียม RELAY-7",
      DEEP: "เขารู้ตัวว่าจะมีการกวาดล้าง (Purge) จึงหนีไปกบดานที่เหมืองระดับลึก B4 Hephaestus-7 พร้อมรหัสล็อกชิ้นสุดท้าย",
      FULL: "เขาได้ทำการเชื่อมต่อระบบประสาทตัวเองเข้ากับเครือข่ายรังแร่เพื่อฝังรหัสกู้คืน แต่อาจทำให้ตัวเขาตกผลึกทางชีวภาพไปแล้ว"
    },
    requiredEvidence: "CLUE_EVANS_DRIVE",
    forbiddenBefore: 1
  },
  dmitri_memory: {
    truthId: "TRUTH_DMITRI_MEMORY",
    topic: "dmitri_memory",
    levels: {
      HINT: "Dmitri จำอะไรไม่ได้หลังจาก Blackout และเสียงวิทยุแทรกแซง Phobos",
      PARTIAL: "Dmitri เริ่มจำได้ว่าสร้างดาวเทียม RELAY-7 ร่วมกับ Evans ก่อนปิดกั้นฐานระบบ",
      DEEP: "เขานึกออกว่าจิตสำนึกถูกดัดแปลงด้วยคลื่นความถี่สูง Neural Pulse จนความทรงจำลบเลือน",
      FULL: "Dmitri จดจำได้หมดสิ้นว่าเขาถูกลบความจำหลังพบความจริงเรื่องดาวเทียมต้องการเหนี่ยวนำคลื่นสมองมนุษย์"
    },
    requiredEvidence: null,
    forbiddenBefore: 1
  }
};

module.exports = CANON_TRUTH;
