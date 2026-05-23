import { useEffect, useState } from 'react'
import useGameStore from '../../store/gameStore'
import styles from './DiceOverlay.module.css'

export default function DiceOverlay() {
  const { ui } = useGameStore()
  const result = ui.diceResult
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    // Show the result details after 1.2s of spinning animation
    const timer = setTimeout(() => {
      setShowResult(true)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  if (!result) return null

  const isCritSuccess = result.roll === 20 || result.outcome === 'critSuccess'
  const isCritFail = result.roll === 1 || result.outcome === 'critFail'
  const isSuccess = result.outcome === 'success' || result.outcome === 'partialSuccess'

  let outcomeClass = styles.outcomeNormal
  let outcomeText = 'RESULT: PARTIAL SUCCESS'

  if (isCritSuccess) {
    outcomeClass = styles.outcomeCritSuccess
    outcomeText = 'CRITICAL SUCCESS'
  } else if (isCritFail) {
    outcomeClass = styles.outcomeCritFail
    outcomeText = 'CRITICAL FAILURE'
  } else if (isSuccess) {
    outcomeClass = styles.outcomeSuccess
    outcomeText = result.outcome === 'success' ? 'SUCCESS' : 'PARTIAL SUCCESS'
  } else {
    outcomeClass = styles.outcomeFailure
    outcomeText = 'FAILED'
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {!showResult ? (
          <div className={styles.diceWrapper}>
            {/* Spinning 3D-like D20 using SVG */}
            <svg className={styles.d20Icon} viewBox="0 0 100 100">
              <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" className={styles.d20Outline} />
              <polygon points="50,5 50,40 90,28" className={styles.d20Face} />
              <polygon points="90,28 50,40 75,70 90,72" className={styles.d20Face} />
              <polygon points="50,95 75,70 90,72" className={styles.d20Face} />
              <polygon points="50,95 50,40 75,70" className={styles.d20Face} />
              <polygon points="50,95 25,70 50,40" className={styles.d20Face} />
              <polygon points="50,95 10,72 25,70" className={styles.d20Face} />
              <polygon points="10,72 25,70 50,40 10,28" className={styles.d20Face} />
              <polygon points="10,28 50,40 50,5" className={styles.d20Face} />
              <text x="50" y="58" className={styles.d20Text}>D20</text>
            </svg>
            <div className={styles.rollingText}>ROLLING DIGITAL D20 ENGINE...</div>
          </div>
        ) : (
          <div className={`${styles.resultWrapper} ${outcomeClass} ${isCritFail ? styles.shake : ''}`}>
            <div className={styles.glowBg} />
            <div className={styles.rollNumber}>{result.roll}</div>
            <div className={styles.outcomeTitle}>{outcomeText}</div>
            {result.narrative && <div className={styles.narrative}>{result.narrative}</div>}
            <div className={styles.statType}>[ CHECK: {result.type?.toUpperCase() || 'D20'} ]</div>
          </div>
        )}
      </div>
    </div>
  )
}
