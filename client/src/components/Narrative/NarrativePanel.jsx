import { useState, useEffect, useRef, useCallback } from 'react'
import useGameStore from '../../store/gameStore'
import { game as gameApi } from '../../api/gameApi'
import styles from './NarrativePanel.module.css'

// ─── Typewriter Hook ─────────────────────────────────────
function useTypewriter(text, speed = 28, active = true) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const prevText = useRef('')
  const timerRef = useRef(null)

  useEffect(() => {
    if (!active || !text) {
      setDisplayed(text || '')
      setDone(true)
      return
    }
    if (text === prevText.current) return
    prevText.current = text
    setDone(false)
    setDisplayed('')

    let i = 0
    const tick = () => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i))
        i++
        timerRef.current = setTimeout(tick, speed)
      } else {
        setDone(true)
      }
    }
    timerRef.current = setTimeout(tick, speed)
    return () => clearTimeout(timerRef.current)
  }, [text, speed, active])

  const skipToEnd = () => {
    clearTimeout(timerRef.current)
    setDisplayed(text)
    setDone(true)
  }

  return { displayed, done, skipToEnd }
}

// ─── Atmosphere Config ───────────────────────────────────
const ATMOSPHERE = {
  calm:   { color: 'var(--blue)',   label: 'CALM',   icon: '◈' },
  tense:  { color: 'var(--yellow)', label: 'TENSE',  icon: '⚠' },
  horror: { color: 'var(--purple)', label: 'HORROR', icon: '☠' },
  action: { color: 'var(--accent)', label: 'ACTION', icon: '⚡' },
}

// ─── Choice Button ───────────────────────────────────────
function ChoiceButton({ choice, onSelect, disabled, loading }) {
  const hasReq = choice.requirement
  const cannotMeet = hasReq && !choice.requirementMet

  return (
    <button
      className={`${styles.choiceBtn} ${cannotMeet ? styles.choiceDisabled : ''}`}
      onClick={() => !cannotMeet && !disabled && onSelect(choice)}
      disabled={disabled || cannotMeet}
      title={cannotMeet ? `Requires: ${choice.requirement}` : ''}
    >
      <span className={styles.choiceArrow}>▶</span>
      <span className={styles.choiceText}>{choice.text}</span>
      {hasReq && (
        <span className={`badge ${cannotMeet ? 'badge-red' : 'badge-green'} ${styles.choiceReqBadge}`}>
          {choice.requirement}
        </span>
      )}
      {choice.difficulty && (
        <span className={`badge ${styles.choiceDiffBadge}`}
          style={{ color: choice.difficulty === 'Hard' ? '#ff6060' : choice.difficulty === 'Medium' ? '#e8a840' : '#60c090' }}>
          {choice.difficulty}
        </span>
      )}
      {loading && <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, marginLeft: 'auto' }} />}
    </button>
  )
}

// ─── Combat Log Preview ──────────────────────────────────
function CombatLogPreview({ log }) {
  if (!log?.length) return null
  return (
    <div className={styles.combatLogPreview}>
      <div className={styles.combatLogTitle}>// COMBAT LOG</div>
      {log.slice(0, 3).map((entry, i) => (
        <div key={i} className={`${styles.combatLogEntry} ${styles[`log_${entry.type || 'system'}`]}`}>
          <span className={styles.combatLogIcon}>
            {entry.type === 'player' ? '▶' : entry.type === 'enemy' ? '◀' : '·'}
          </span>
          {entry.text}
        </div>
      ))}
    </div>
  )
}

// ─── Narrative Panel ─────────────────────────────────────
export default function NarrativePanel({ onStateUpdate }) {
  const { narrative, combat, triggerDiceRoll, setNarrativeState, setPlayerState, setCombatState, setError } = useGameStore()

  const [actionLoading, setActionLoading] = useState(false)
  const [activeChoiceId, setActiveChoiceId] = useState(null)
  const scrollRef = useRef(null)

  const atm = ATMOSPHERE[narrative.atmosphere] || ATMOSPHERE.calm
  const { displayed, done, skipToEnd } = useTypewriter(
    narrative.nodeText,
    28,
    true
  )

  // Scroll narrative text to bottom when new text appears
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [displayed])

  const handleChoice = useCallback(async (choice) => {
    if (actionLoading) return
    setActionLoading(true)
    setActiveChoiceId(choice.id)

    try {
      const res = await gameApi.action({
        choiceId: choice.id,
        nodeId: narrative.currentNode,
      })

      const data = res.data

      // Show dice roll if server rolled dice
      if (data.diceRoll) {
        triggerDiceRoll(data.diceRoll)
        // Wait for dice animation to begin before updating text
        await new Promise(r => setTimeout(r, 400))
      }

      // Update state
      if (data.narrative) setNarrativeState(data.narrative)
      if (data.player)    setPlayerState(data.player)
      if (data.combat)    setCombatState(data.combat)

      // Trigger game state refresh
      if (onStateUpdate) onStateUpdate()

    } catch (err) {
      setError(err.response?.data?.message || 'ACTION FAILED')
    } finally {
      setActionLoading(false)
      setActiveChoiceId(null)
    }
  }, [actionLoading, narrative.currentNode, triggerDiceRoll, setNarrativeState, setPlayerState, setCombatState, setError, onStateUpdate])

  const hazardBadge = narrative.hazards?.length > 0

  return (
    <div className={styles.panel} style={{ '--atm-color': atm.color }}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.locationName}>
            <span className={styles.locationIcon}>◈</span>
            <span>{narrative.location || 'UNKNOWN LOCATION'}</span>
          </div>
          {hazardBadge && narrative.hazards.map((h, i) => (
            <span key={i} className="badge badge-yellow">{h}</span>
          ))}
        </div>
        <div className={styles.headerRight}>
          <div className={styles.atmosphereBadge} style={{ borderColor: atm.color, color: atm.color }}>
            <span>{atm.icon}</span>
            <span>{atm.label}</span>
          </div>
        </div>
      </div>

      {/* Atmosphere top border line */}
      <div className={styles.atmLine} style={{ background: atm.color }} />

      {/* ── Narrative text area ── */}
      <div
        className={styles.textArea}
        ref={scrollRef}
        onClick={!done ? skipToEnd : undefined}
        style={{ cursor: !done ? 'pointer' : 'default' }}
        title={!done ? 'Click to skip' : ''}
      >
        {narrative.nodeText ? (
          <div className={styles.narrativeText}>
            <p>{displayed}</p>
            {!done && <span className="typewriter-cursor" />}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>◈</div>
            <p className={styles.emptyText}>Awaiting transmission from Mars Colonial Network...</p>
            <p className={styles.emptySubtext}>// SIGNAL STRENGTH: NOMINAL</p>
          </div>
        )}
      </div>

      {/* ── Choices ── */}
      {done && narrative.choices?.length > 0 && (
        <div className={styles.choices}>
          <div className={styles.choicesHeader}>
            <span className={styles.choicesTitle}>// AVAILABLE ACTIONS</span>
            <span className={styles.choicesHint}>Select your response</span>
          </div>
          <div className={styles.choicesList}>
            {narrative.choices.map((choice) => (
              <ChoiceButton
                key={choice.id}
                choice={choice}
                onSelect={handleChoice}
                disabled={actionLoading}
                loading={activeChoiceId === choice.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading choices state */}
      {actionLoading && !narrative.choices?.length && (
        <div className={styles.loadingChoices}>
          <div className="spinner" />
          <span>Processing action...</span>
        </div>
      )}

      {/* ── Combat Log preview when combat is active ── */}
      {combat.active && <CombatLogPreview log={combat.log} />}

      {/* Decorative corner */}
      <div className={styles.cornerDecorTR} />
    </div>
  )
}
