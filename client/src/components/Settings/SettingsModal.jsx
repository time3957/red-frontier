import React from 'react'
import useGameStore from '../../store/gameStore'
import styles from './SettingsModal.module.css'

export default function SettingsModal({ onClose }) {
  const { accessibility, setAccessibility } = useGameStore((state) => ({
    accessibility: state.ui.accessibility,
    setAccessibility: state.setAccessibility,
  }))

  const handleBrightnessChange = (e) => {
    const val = parseFloat(e.target.value)
    setAccessibility('brightness', val)
  }

  const handleFontSizeChange = (e) => {
    const val = parseFloat(e.target.value)
    setAccessibility('fontSize', val)
  }

  const handleContrastChange = (e) => {
    const val = parseFloat(e.target.value)
    setAccessibility('contrast', val)
  }

  const adjustBrightness = (amount) => {
    const nextVal = Math.min(1.8, Math.max(0.7, parseFloat((accessibility.brightness + amount).toFixed(1))))
    setAccessibility('brightness', nextVal)
  }

  const adjustFontSize = (amount) => {
    const nextVal = Math.min(1.8, Math.max(0.9, parseFloat((accessibility.fontSize + amount).toFixed(1))))
    setAccessibility('fontSize', nextVal)
  }

  const adjustContrast = (amount) => {
    const nextVal = Math.min(1.4, Math.max(0.8, parseFloat((accessibility.contrast + amount).toFixed(1))))
    setAccessibility('contrast', nextVal)
  }

  const handleReset = () => {
    setAccessibility('brightness', 1.0)
    setAccessibility('fontSize', 1.0)
    setAccessibility('contrast', 1.0)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span>⚙</span> ตั้งค่าการแสดงผล & การเข้าถึง
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          
          <div className={styles.sectionTitle}>การตั้งค่าการเข้าถึง (Accessibility)</div>

          {/* Brightness Control */}
          <div className={styles.controlGroup}>
            <div className={styles.controlLabel}>
              <span className={styles.labelText}>🔆 ปรับความสว่าง (Brightness)</span>
              <span className={styles.labelValue}>{Math.round(accessibility.brightness * 100)}%</span>
            </div>
            <div className={styles.sliderContainer}>
              <button 
                className={styles.sliderBtn} 
                onClick={() => adjustBrightness(-0.1)}
                title="ลดความสว่าง"
              >
                -
              </button>
              <input
                type="range"
                min="0.7"
                max="1.8"
                step="0.05"
                value={accessibility.brightness}
                onChange={handleBrightnessChange}
                className={styles.slider}
              />
              <button 
                className={styles.sliderBtn} 
                onClick={() => adjustBrightness(0.1)}
                title="เพิ่มความสว่าง"
              >
                +
              </button>
            </div>
          </div>

          {/* Contrast Control */}
          <div className={styles.controlGroup}>
            <div className={styles.controlLabel}>
              <span className={styles.labelText}>🌓 ปรับความคมชัด (Contrast)</span>
              <span className={styles.labelValue}>{Math.round(accessibility.contrast * 100)}%</span>
            </div>
            <div className={styles.sliderContainer}>
              <button 
                className={styles.sliderBtn} 
                onClick={() => adjustContrast(-0.1)}
                title="ลดความคมชัด"
              >
                -
              </button>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={accessibility.contrast}
                onChange={handleContrastChange}
                className={styles.slider}
              />
              <button 
                className={styles.sliderBtn} 
                onClick={() => adjustContrast(0.1)}
                title="เพิ่มความคมชัด"
              >
                +
              </button>
            </div>
          </div>

          {/* Font Size Control */}
          <div className={styles.controlGroup}>
            <div className={styles.controlLabel}>
              <span className={styles.labelText}>🔎 ขนาดตัวอักษรเมนูและข้อความ (Font Size)</span>
              <span className={styles.labelValue}>{Math.round(accessibility.fontSize * 100)}%</span>
            </div>
            <div className={styles.sliderContainer}>
              <button 
                className={styles.sliderBtn} 
                onClick={() => adjustFontSize(-0.1)}
                title="ลดขนาดตัวอักษร"
              >
                -
              </button>
              <input
                type="range"
                min="0.9"
                max="1.8"
                step="0.05"
                value={accessibility.fontSize}
                onChange={handleFontSizeChange}
                className={styles.slider}
              />
              <button 
                className={styles.sliderBtn} 
                onClick={() => adjustFontSize(0.1)}
                title="เพิ่มขนาดตัวอักษร"
              >
                +
              </button>
            </div>
          </div>

          {/* Preview Box */}
          <div className={styles.previewBox}>
            <div className={styles.previewTitle}>// ตัวอย่างการแสดงผล / preview</div>
            <div className={styles.previewTitleThai}>◈ Olympus Base — Airlock Alpha</div>
            <div className={styles.previewDescThai}>
              ระบบ Life Support ทำงานปกติ | ออกซิเจนเหลือ 100% ตัวอักษรเมนูต่าง ๆ จะขยายและเพิ่มความสว่างขึ้นตามที่คุณปรับแต่งด้านบน
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.resetBtn} onClick={handleReset}>
            คืนค่าเริ่มต้น (Reset)
          </button>
          <button className={styles.saveBtn} onClick={onClose}>
            ตกลง (OK)
          </button>
        </div>

      </div>
    </div>
  )
}
