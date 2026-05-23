import { useState, useCallback } from 'react'
import useGameStore from '../../store/gameStore'
import { game as gameApi } from '../../api/gameApi'
import styles from './CombatPanel.module.css'

// ─── Enemy Card ──────────────────────────────────────────
function EnemyCard({ enemy, selected, onSelect, disabled }) {
  const hpPct  = enemy.maxHp  > 0 ? (enemy.hp  / enemy.maxHp)  * 100 : 0
  const siPct  = enemy.maxSi  > 0 ? (enemy.si  / enemy.maxSi)  * 100 : 0
  const isDead = enemy.hp <= 0

  return (
    <div
      className={`${styles.enemyCard} ${selected ? styles.enemySelected : ''} ${isDead ? styles.enemyDead : ''}`}
      onClick={() => !isDead && !disabled && onSelect(enemy.id)}
    >
      {isDead && <div className={styles.deadOverlay}>ELIMINATED</div>}

      <div className={styles.enemyHeader}>
        <span className={styles.enemyIcon}>{enemy.icon || '👾'}</span>
        <div className={styles.enemyInfo}>
          <div className={styles.enemyName}>{enemy.name}</div>
          <div className={styles.enemyType}>{enemy.type || 'HOSTILE'}</div>
        </div>
        {selected && !isDead && <div className={styles.targetIndicator}>◉ TARGET</div>}
      </div>

      {/* HP Bar */}
      <div className={styles.enemyStat}>
        <span className={styles.enemyStatLabel}>HP</span>
        <div className={styles.enemyBarTrack}>
          <div
            className={styles.enemyBarFillHp}
            style={{ width: `${hpPct}%`, background: hpPct < 30 ? 'linear-gradient(90deg, #7a1a1a, var(--red))' : 'linear-gradient(90deg, #7a1a1a, var(--red), #ff5555)' }}
          />
        </div>
        <span className={styles.enemyStatVal}>{enemy.hp}/{enemy.maxHp}</span>
      </div>

      {/* SI Bar */}
      {enemy.maxSi > 0 && (
        <div className={styles.enemyStat}>
          <span className={styles.enemyStatLabel}>SI</span>
          <div className={styles.enemyBarTrack}>
            <div
              className={styles.enemyBarFillSi}
              style={{ width: `${siPct}%` }}
            />
          </div>
          <span className={styles.enemyStatVal}>{enemy.si}/{enemy.maxSi}</span>
        </div>
      )}

      {/* Status badges */}
      {enemy.statusEffects?.length > 0 && (
        <div className={styles.enemyStatus}>
          {enemy.statusEffects.map((s, i) => (
            <span key={i} className="badge badge-purple">{s}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Combat Log ──────────────────────────────────────────
function CombatLog({ entries }) {
  const maxEntries = entries.slice(0, 5)
  return (
    <div className={styles.combatLog}>
      <div className={styles.logTitle}>// COMBAT LOG</div>
      <div className={styles.logEntries}>
        {maxEntries.length === 0 && (
          <div className={styles.logEmpty}>No combat actions yet...</div>
        )}
        {maxEntries.map((entry, i) => (
          <div
            key={i}
            className={`${styles.logEntry} ${styles[`log_${entry.type || 'system'}`]}`}
            style={{ opacity: 1 - i * 0.18 }}
          >
            <span className={styles.logIcon}>
              {entry.type === 'player' ? '▶' : entry.type === 'enemy' ? '◀' : entry.type === 'crit' ? '★' : '·'}
            </span>
            <span>{entry.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Initiative Order ────────────────────────────────────
function InitiativeOrder({ order, currentTurn }) {
  if (!order?.length) return null
  return (
    <div className={styles.initiative}>
      <div className={styles.initiativeTitle}>INITIATIVE</div>
      <div className={styles.initiativeList}>
        {order.map((actor, i) => (
          <div
            key={actor.id || i}
            className={`${styles.initiativeItem} ${actor.id === currentTurn ? styles.initiativeCurrent : ''}`}
          >
            <span className={styles.initiativeRank}>{i + 1}</span>
            <span className={styles.initiativeName}>{actor.name}</span>
            <span className={styles.initiativeVal}>{actor.initiative}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Result Overlay ──────────────────────────────────────
function ResultOverlay({ result, onDismiss }) {
  if (!result) return null
  const isVictory = result.type === 'victory'
  const isDefeat  = result.type === 'defeat'

  return (
    <div className={`${styles.resultOverlay} ${isVictory ? styles.resultVictory : styles.resultDefeat}`}>
      <div className={styles.resultIcon}>{isVictory ? '★' : '☠'}</div>
      <div className={styles.resultTitle}>{isVictory ? 'MISSION COMPLETE' : 'OPERATOR DOWN'}</div>
      <div className={styles.resultText}>{result.text}</div>
      {result.rewards && isVictory && (
        <div className={styles.resultRewards}>
          {result.rewards.xp && <span className="badge badge-accent">+{result.rewards.xp} XP</span>}
          {result.rewards.credits && <span className="badge badge-yellow">+₡{result.rewards.credits}</span>}
          {result.rewards.items?.map((item, i) => <span key={i} className="badge badge-green">{item}</span>)}
        </div>
      )}
      <button className="btn btn-primary" onClick={onDismiss}>
        {isVictory ? 'CONTINUE MISSION ▶' : '▶ CONTINUE'}
      </button>
    </div>
  )
}

// ─── Combat Actions ──────────────────────────────────────
const ACTIONS = [
  { id: 'attack',   label: 'ATTACK',   icon: '⚔', color: 'var(--red)',    desc: 'Strike target' },
  { id: 'dodge',    label: 'DODGE',    icon: '◌', color: 'var(--blue)',   desc: 'Evade next hit' },
  { id: 'use_item', label: 'USE ITEM', icon: '⊕', color: 'var(--green)',  desc: 'Use inventory item' },
  { id: 'flee',     label: 'FLEE',     icon: '↗', color: 'var(--yellow)', desc: 'Attempt escape' },
]

// ─── Combat Panel ────────────────────────────────────────
export default function CombatPanel({ onStateUpdate }) {
  const { combat, player, setPlayerState, setNarrativeState, setCombatState, triggerDiceRoll, triggerScreenShake, setError } = useGameStore()

  const [selectedTarget, setSelectedTarget] = useState(null)
  const [selectedAction, setSelectedAction] = useState('attack')
  const [loading, setLoading] = useState(false)
  const [resultOverlay, setResultOverlay] = useState(null)

  const isPlayerTurn = combat.turn === 'player'
  const liveEnemies = combat.enemies.filter(e => e.hp > 0)

  const handleCombatAction = useCallback(async () => {
    if (!isPlayerTurn || loading) return
    if (selectedAction === 'attack' && !selectedTarget) return

    setLoading(true)
    try {
      const res = await gameApi.combatAction({
        action: selectedAction,
        targetId: selectedTarget,
      })

      const data = res.data

      // Dice roll
      if (data.diceRoll) {
        triggerDiceRoll(data.diceRoll)
        if (data.diceRoll.outcome === 'critFail' || data.diceRoll.roll === 1) {
          triggerScreenShake()
        }
      }

      // Update states
      if (data.player)    setPlayerState(data.player)
      if (data.combat)    setCombatState(data.combat)
      if (data.narrative) setNarrativeState(data.narrative)

      // Show victory / defeat
      if (data.combatResult) {
        setResultOverlay(data.combatResult)
      }

      if (onStateUpdate) onStateUpdate()

    } catch (err) {
      setError(err.response?.data?.message || 'COMBAT ACTION FAILED')
    } finally {
      setLoading(false)
    }
  }, [isPlayerTurn, loading, selectedAction, selectedTarget, triggerDiceRoll, triggerScreenShake, setPlayerState, setCombatState, setNarrativeState, setError, onStateUpdate])

  const handleDismissResult = () => {
    setResultOverlay(null)
    setCombatState({ active: false, enemies: [], log: [], round: 1 })
    if (onStateUpdate) onStateUpdate()
  }

  return (
    <div className={styles.panel}>
      {/* Result overlay */}
      {resultOverlay && (
        <ResultOverlay result={resultOverlay} onDismiss={handleDismissResult} />
      )}

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.combatTitle}>⚔ COMBAT ENGAGED</div>
          <div className={styles.roundBadge}>ROUND {combat.round}</div>
        </div>
        <div className={styles.turnIndicator}>
          {isPlayerTurn ? (
            <div className={styles.turnPlayer}>YOUR TURN</div>
          ) : (
            <div className={styles.turnEnemy}>
              {typeof combat.turn === 'string' && combat.turn !== 'player'
                ? `${combat.turn.toUpperCase()} ACTING...`
                : 'ENEMY TURN'}
            </div>
          )}
        </div>
        <InitiativeOrder order={combat.initiativeOrder} currentTurn={combat.turn} />
      </div>

      <div className={styles.body}>
        {/* ── Left: Enemies ── */}
        <div className={styles.enemies}>
          <div className={styles.sectionTitle}>// HOSTILES ({liveEnemies.length})</div>
          <div className={styles.enemyList}>
            {combat.enemies.map(enemy => (
              <EnemyCard
                key={enemy.id}
                enemy={enemy}
                selected={selectedTarget === enemy.id}
                onSelect={setSelectedTarget}
                disabled={!isPlayerTurn || selectedAction !== 'attack' || loading}
              />
            ))}
            {combat.enemies.length === 0 && (
              <div className={styles.noEnemies}>No hostiles detected...</div>
            )}
          </div>
        </div>

        {/* ── Right: Actions + Log ── */}
        <div className={styles.rightCol}>
          {/* Action selector */}
          {isPlayerTurn && (
            <div className={styles.actionSection}>
              <div className={styles.sectionTitle}>// SELECT ACTION</div>
              <div className={styles.actionGrid}>
                {ACTIONS.map(action => (
                  <button
                    key={action.id}
                    className={`${styles.actionBtn} ${selectedAction === action.id ? styles.actionSelected : ''}`}
                    onClick={() => setSelectedAction(action.id)}
                    style={{ '--action-color': action.color }}
                    title={action.desc}
                    disabled={loading}
                  >
                    <span className={styles.actionIcon}>{action.icon}</span>
                    <span className={styles.actionLabel}>{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Execute button */}
              {selectedAction === 'attack' && !selectedTarget && liveEnemies.length > 0 && (
                <div className={styles.targetHint}>◉ Select a target above</div>
              )}

              <button
                className={`btn btn-primary ${styles.executeBtn}`}
                onClick={handleCombatAction}
                disabled={loading || (selectedAction === 'attack' && !selectedTarget)}
              >
                {loading ? (
                  <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> RESOLVING...</>
                ) : (
                  `▶ EXECUTE: ${ACTIONS.find(a => a.id === selectedAction)?.label}`
                )}
              </button>
            </div>
          )}

          {/* Enemy turn indicator */}
          {!isPlayerTurn && (
            <div className={styles.waitSection}>
              <div className={styles.waitIcon}>◉</div>
              <div className={styles.waitText}>
                {typeof combat.turn === 'string' && combat.turn !== 'player'
                  ? `${combat.turn} is acting...`
                  : 'Enemy is acting...'}
              </div>
              <div className="spinner" />
            </div>
          )}

          {/* Combat Log */}
          <CombatLog entries={combat.log || []} />
        </div>
      </div>
    </div>
  )
}
