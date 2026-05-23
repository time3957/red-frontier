# 🚀 RED FRONTIER — Phase 2.5: Audit & Lock Summary

ไฟล์นี้สรุปผลการตรวจสอบระบบเรื่องราว (Dialogue & Reveal Control System) ตามแผน **Phase 2.5: Audit & Lock** เพื่อให้เมื่อเปิดไฟล์นี้ขึ้นมาในวันพรุ่งนี้ จะสามารถเริ่มงานต่อใน **Phase 3: Dialogue UI & Frontend Integration** ได้ทันที

---

## 📊 สถานะการทำงานของระบบ (Audit Results Summary)

1. **พบปัญหาอะไรบ้าง (Discovered Issues):**
   * 🔍 **Evans Topic Leak/Lock:** ตรวจพบว่าหัวข้อสนทนา `evans` ใน `dialogueNodes.js` ไม่ได้ถูกลงทะเบียนไว้ใน `canonTruth.js`, `Player.js` (Schema), `npcKnowledgeScope.js` และ `revealControl.js` ซึ่งทำให้ระบบข้ามการตรวจสอบหลักฐานและ Act Capping ของหัวข้อ Evans ไปโดยปริยาย
   * 🔍 **Dmitri Memory Lock Bug:** ตรวจพบว่าหัวข้อ `dmitri_memory` ไม่ถูกจัดวางไว้ใน `maxRevealLevelByAct` ของ Dmitri ส่งผลให้ระบบประเมินค่าความรู้ของ Dmitri เป็น `'HINT'` เสมอ แม้ว่าผู้เล่นจะปลดล็อกตัวแปร `dmitriMemoriesUnlocked = 4` ใน Act IV แล้วก็ตาม (Dmitri จะไม่สามารถพูดความจำฉบับ `FULL` ได้เลย)
   * 🔍 **Missing Evidence & Hardcoded Denominators:** ตัวแปรหลักฐาน `CLUE_VASQUEZ_WARNING` (ใช้สำหรับความลับฝ่าย ISU) ไม่ถูกเซ็ตค่าไว้ใน `seed.js` ทำให้อาจเรียกข้อมููลหลักฐานนี้ไม่พบในระบบฐานข้อมูล และพบว่าสูตรคำนวณเปอร์เซ็นต์เก็บหลักฐานถูกฮาร์ดโค้ดเป็นตัวหาร `/ 12` ในไฟล์ `routes/game.js` และ `routes/evidence.js` ซึ่งจะพังเมื่อเพิ่มเบาะแสที่ 13 เข้ามาในระบบ

2. **แก้ไฟล์อะไรบ้าง (Modified Files):**
   * 🛠️ [canonTruth.js](file:///d:/GProject/server/src/data/canonTruth.js) — เพิ่มหัวข้อ `evans` และ `dmitri_memory` พร้อมรายละเอียดการเปิดเผยความลับแต่ละระดับ
   * 🛠️ [Player.js](file:///d:/GProject/server/src/models/Player.js) — เพิ่มฟิลด์ `evans` และ `dmitri_memory` ใน Mongoose `revealLevels` Schema
   * 🛠️ [npcKnowledgeScope.js](file:///d:/GProject/server/src/data/npcKnowledgeScope.js) — ลงทะเบียนหัวข้อ `evans` และ `dmitri_memory` ให้กับ NPC ทุกตัว เพื่อป้องกันขีดจำกัดความรู้เกินระดับ
   * 🛠️ [revealControl.js](file:///d:/GProject/server/src/engine/revealControl.js) — ปรับแต่งระบบจับคู่เบาะแสหลักฐาน (เช่น `CLUE_EVANS_DRIVE` สำหรับ `evans`) และตั้งค่าเริ่มต้นความลับตัวแปรใหม่เป็น `NONE` เพื่อป้องกันการ Crash
   * 🛠️ [seed.js](file:///d:/GProject/server/src/seed.js) — เพิ่มเบาะแส `CLUE_VASQUEZ_WARNING` เข้าในระบบฐานข้อมูลหลักเพื่อตอบรับเงื่อนไขของหัวข้อ ISU Complicity และปรับ Console Log ให้รองรับจำนวนเบาะแสแบบไดนามิก (รวม 13 เบาะแส)
   * 🛠️ [evidence.js](file:///d:/GProject/server/src/routes/evidence.js) — ปรับตัวหารและเปอร์เซ็นต์ความสำเร็จของบอร์ดหลักฐานให้สอดคล้องตามจำนวนข้อมูลจริงในระบบ (`countDocuments()`) ป้องกันบัคหน้าจอแสดงผลเปอร์เซ็นต์เกิน 100%
   * 🛠️ [game.js](file:///d:/GProject/server/src/routes/game.js) — ปรับเปลี่ยนตัวหารคำนวณความสำเร็จบอร์ดหลักฐานในการเก็บหลักฐานและสำรวจให้เป็นแบบไดนามิกเช่นกัน
   * 🛠️ [testRevealControl.js](file:///d:/GProject/server/src/engine/testRevealControl.js) — อัปเดตชุดแบบทดสอบและเพิ่มเคสตรวจสอบความถูกต้องตามเกณฑ์ Phase 2.5

3. **Test ที่เพิ่มเข้ามา (Added Automated Assertions):**
   * `7.1 Topic Validation` — ตรวจสอบว่าหัวข้อทั้งหมดใน `dialogueNodes.js` ต้องได้รับการประกาศอยู่ใน `canonTruth.js` หรือระบุใน Whitelist
   * `7.2 NPC Scope Validation` — ตรวจสอบว่า `npcId` ทั้งหมดที่มีในระบบบทสนทนามีการควบคุมขอบเขตความรู้ใน `npcKnowledgeScope.js`
   * `7.3 Required Evidence Seeding Check` — สแกนหาคำศัพท์ `clueId` ในไฟล์ `seed.js` เพื่อยันยืนว่าหลักฐานที่ต้องใช้ปลดล็อก Lore ทุกตัวมีอยู่ในฐานข้อมูลจริง
   * `7.4 Act I Leak Check` — ป้องกันไม่ให้บทพูดใด ๆ ของ Yara และ Dmitri ใน Act I หลุดพูดคำต้องห้ามในตอนท้ายเรื่อง (เช่น *Martian Hive*, *Neural Medium*, *soul upload*, *Convergence*)
   * `7.5 Yara Act IV DEEP Cap Check` — การันตีว่าระดับคำตอบเรื่อง Aresium ของ Yara ในบทที่ 4 จะไม่มีวันเฉลยเกินระดับ `DEEP` (ไม่เฉลยคำว่า Martian Hive เด็ดขาด)
   * `7.6 RELAY-7 Act IV FULL Check` — ตรวจสอบว่า `relay7_npc` จะสามารถปลดล็อกความจริงระดับ `FULL` ได้เฉพาะเมื่ออยู่ใน Act IV และรวบรวมหลักฐานครบถ้วนแล้วเท่านั้น
   * `7.7 Old Save Compatibility Check` — จำลองกรณีผู้ใช้เข้าสู่ระบบด้วยเซฟแบบเก่าที่ไม่มีฟิลด์ `knowledgeState` ในระบบฐานข้อมูล และทดสอบว่าระบบสามารถ Resolve ข้ามผ่านและตั้งค่าความปลอดภัยเริ่มใหม่โดยไม่เกิดการล่ม (Crash)

4. **ผลการรัน Test (Test Verification):**
   * ✅ **`testRevealControl.js`:** ผ่านสำเร็จครบถ้วน **16/16 เคส**
   * ✅ **`testNarrativeFlow.js`:** ผ่านสำเร็จครบถ้วน **15 โหนดเรื่องราว, 2 บทสนทนา, ข้อผิดพลาด 0, คำเตือน 0**
   * 🌐 **Git Sync:** ดำเนินการ Commit และ Push อัปเดตไฟล์เวอร์ชันเสถียรที่สุดเข้าสู่ GitHub Repository `main` เรียบร้อยแล้ว

---

## 🟢 ความพร้อมสำหรับ Phase 3 (Dialogue UI & Frontend)

**ระบบหลังบ้าน (Backend & Engine) มีความพร้อมสำหรับเริ่มงาน Phase 3 เต็ม 100%**
ขีดความสามารถการเปิดเผยข้อมูลจำเพาะ บทสนทนา และความปลอดภัยในการเฉลยปมของเรื่องราวได้รับการล็อคไว้อย่างหนาแน่นแล้ว

---

## 📅 สิ่งที่ต้องเริ่มทำในวันพรุ่งนี้ (Phase 3 To-Do List)

ในวันพรุ่งนี้คุณสามารถดำเนินงานฝั่ง **Client / Frontend** ต่อไปนี้ได้ทันที:
1. **อัปเดต HUD / Character State UI:**
   * ตรวจสอบให้แน่ใจว่าหน้าจอ HUD ดึงข้อมูลสถานะ `character` และ `narrativeState` จาก Player ล่าสุดได้ถูกต้อง
2. **สร้างหน้าจอแสดงผลบทสนทนา (Dialogue Panel UI) บน `client/src/components/Narrative/NarrativePanel.jsx`:**
   * ออกแบบ UI ให้รองรับพฤติกรรมบทสนทนาระหว่างคุยกับ NPC
   * แสดงตัวเลือกประเภท `dialogue` (ไม่เปลี่ยนโหนด และส่งคำถามไปยังฝั่งเซิร์ฟเวอร์เพื่อนำคำตอบกลับมาฉายทาง Typewriter Effect)
   * เพิ่มปุ่มตัวเลือกแบบมีเงื่อนไขและคลาส (เช่น Badge คลาส,Badge หลักฐาน)
3. **พัฒนา Evidence Board & Connection UI:**
   * ปรับแต่งหน้าจอ `client/src/components/EvidenceBoard/EvidenceBoard.jsx` ให้ดึงข้อมูลแบบไดนามิก 13 หลักฐาน และลากเส้นเชื่อมโยงเบาะแส
4. **ทำสอบปลายทาง (End-to-End Test):**
   * รันโปรเจกต์คู่กัน (`npm run dev`) และใช้หน้าจอทดสอบประจัญบานกับ Yara และ Dmitri ในเหมืองจำลอง
