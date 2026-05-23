import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useGameStore from '../store/gameStore'
import { game as gameApi } from '../api/gameApi'

import HUD from '../components/HUD/HUD.jsx'
import NarrativePanel from '../components/Narrative/NarrativePanel.jsx'
import CombatPanel from '../components/Combat/CombatPanel.jsx'
import EvidenceBoard from '../components/EvidenceBoard/EvidenceBoard.jsx'
import DiceOverlay from '../components/DiceRoll/DiceOverlay.jsx'
import styles from './GameScreen.module.css'

// ─── Location Art Scenes (CSS-based) ────────────────────
function LocationScene({ location }) {
  const getScene = (loc = '') => {
    const l = loc.toLowerCase()
    if (l.includes('airlock') || l.includes('base')) return 'base'
    if (l.includes('surface') || l.includes('mars') || l.includes('crater')) return 'surface'
    if (l.includes('corridor') || l.includes('lab') || l.includes('research')) return 'interior'
    if (l.includes('mine') || l.includes('tunnel') || l.includes('underground')) return 'underground'
    if (l.includes('hab') || l.includes('quarters') || l.includes('dome')) return 'habitat'
    return 'base'
  }

  const scene = getScene(location)

  return (
    <div className={`${styles.locationScene} ${styles[`scene_${scene}`]}`}>
      <div className={styles.sceneOverlay} />
      <div className={styles.sceneContent}>
        {scene === 'base' && (
          <>
            <div className={styles.sceneBg_base} />
            <div className={styles.sceneElement} style={{ left: '20%', bottom: '30%' }}>⬡</div>
            <div className={styles.sceneElement} style={{ right: '15%', bottom: '40%' }}>⬢</div>
            <div className={styles.sceneHorizon} />
            <div className={styles.sceneStar} style={{ top: '15%', left: '30%' }}>·</div>
            <div className={styles.sceneStar} style={{ top: '8%', right: '25%' }}>·</div>
            <div className={styles.sceneStar} style={{ top: '25%', left: '60%' }}>·</div>
          </>
        )}
        {scene === 'surface' && (
          <>
            <div className={styles.sceneBg_surface} />
            <div className={styles.sceneDustCloud} />
            <div className={styles.sceneHorizon} />
          </>
        )}
        {scene === 'interior' && (
          <>
            <div className={styles.sceneBg_interior} />
            <div className={styles.sceneGrid_interior} />
          </>
        )}
        {scene === 'underground' && (
          <>
            <div className={styles.sceneBg_underground} />
          </>
        )}
        {scene === 'habitat' && (
          <>
            <div className={styles.sceneBg_habitat} />
            <div className={styles.sceneHorizon} />
          </>
        )}
      </div>
      <div className={styles.sceneVignette} />
      <div className={styles.sceneLabel}>
        <span className={styles.sceneLabelText}>◈ {location}</span>
      </div>
    </div>
  )
}

// ─── Mini Map Dot ────────────────────────────────────────
function MiniMap({ location }) {
  // Simplified 5-zone map
  const zones = [
    { id: 'base', label: 'BASE', x: 50, y: 50 },
    { id: 'surface', label: 'SURFACE', x: 20, y: 30 },
    { id: 'mine', label: 'MINE', x: 75, y: 70 },
    { id: 'lab', label: 'LAB', x: 70, y: 25 },
    { id: 'habitat', label: 'HAB', x: 30, y: 70 },
  ]

  const currentZone = zones[0] // default to base

  return (
    <div className={styles.miniMap}>
      <div className={styles.miniMapTitle}>TACTICAL MAP</div>
      <div className={styles.miniMapCanvas}>
        {/* Connection lines */}
        <svg className={styles.miniMapSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
          {zones.slice(1).map(z => (
            <line key={z.id} x1={zones[0].x} y1={zones[0].y} x2={z.x} y2={z.y}
              stroke="rgba(232,92,32,0.2)" strokeWidth="0.5" strokeDasharray="2 2" />
          ))}
        </svg>
        {zones.map(z => (
          <div
            key={z.id}
            className={`${styles.miniMapZone} ${z.id === currentZone.id ? styles.miniMapCurrent : ''}`}
            style={{ left: `${z.x}%`, top: `${z.y}%` }}
          >
            <div className={styles.miniMapDot} />
            <span className={styles.miniMapLabel}>{z.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Status Icons ────────────────────────────────────────
function StatusIcons({ statusEffects = [], hazards = [] }) {
  if (!statusEffects.length && !hazards.length) return null
  return (
    <div className={styles.statusIcons}>
      <div className={styles.statusIconsTitle}>STATUS</div>
      <div className={styles.statusIconsList}>
        {hazards.map((h, i) => (
          <div key={i} className={`${styles.statusIcon} ${styles.statusHazard}`} title={h}>
            ⚠ {h}
          </div>
        ))}
        {statusEffects.map((s, i) => (
          <div key={i} className={`${styles.statusIcon} ${styles.statusEffect}`} title={s}>
            ◈ {s}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Bottom Action Bar ───────────────────────────────────
function ActionBar({ onToggleEvidence, onRest, evidenceCount, evidenceTotal }) {
  return (
    <div className={styles.actionBar}>
      <div className={styles.actionBarLeft}>
        <span className={styles.actionBarLabel}>// ACTIONS</span>
      </div>

      <div className={styles.actionBarCenter}>
        <button className="btn btn-secondary btn-sm" onClick={onRest} title="Rest to recover HP and O2">
          ⟳ REST
        </button>
      </div>

      <div className={styles.actionBarRight}>
        <button
          className={`btn btn-ghost btn-sm ${styles.evidenceBtn}`}
          onClick={onToggleEvidence}
        >
          <span className={styles.evidenceIcon}>◈</span>
          EVIDENCE
          <span className={`badge ${evidenceCount >= evidenceTotal ? 'badge-green' : 'badge-accent'}`}>
            {evidenceCount}/{evidenceTotal}
          </span>
        </button>
      </div>
    </div>
  )
}

// ─── Main Game Screen ────────────────────────────────────
export default function GameScreen() {
  const navigate = useNavigate()
  const {
    player, narrative, combat, evidence, ui,
    setPlayerState, setNarrativeState, setCombatState, setEvidenceState,
    setLoading, setError, triggerScreenShake, toggleEvidenceBoard,
  } = useGameStore()

  // Load game state on mount
  const loadGameState = useCallback(async () => {
    setLoading(true)
    try {
      const res = await gameApi.getState()
      const data = res.data
      if (data.player)    setPlayerState(data.player)
      if (data.narrative) setNarrativeState(data.narrative)
      if (data.combat)    setCombatState(data.combat)
      if (data.evidence)  setEvidenceState(data.evidence)
    } catch (err) {
      if (err.response?.status === 404) {
        // No character yet — redirect to create
        navigate('/create')
      } else {
        setError(err.response?.data?.message || 'FAILED TO LOAD GAME STATE')
      }
    } finally {
      setLoading(false)
    }
  }, [navigate, setPlayerState, setNarrativeState, setCombatState, setEvidenceState, setLoading, setError])

  useEffect(() => {
    loadGameState()
  }, [loadGameState])

  // Keyboard shortcut: E for Evidence Board
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'e' || e.key === 'E') {
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          toggleEvidenceBoard()
        }
      }
      if (e.key === 'Escape') {
        if (ui.evidenceBoardOpen) toggleEvidenceBoard()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleEvidenceBoard, ui.evidenceBoardOpen])

  const handleRest = async () => {
    try {
      const { character: charApi } = await import('../api/gameApi')
      const res = await charApi.rest()
      if (res.data) setPlayerState(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'REST FAILED')
    }
  }

  return (
    <div className={`${styles.screen} ${ui.screenShake ? 'screen-shake' : ''}`}>
      {/* O2 vignette */}
      {ui.o2Alert && <div className="o2-vignette" />}

      {/* ── HUD ── */}
      <HUD />

      {/* ── Main layout ── */}
      <div className={styles.main}>

        {/* Left panel */}
        <div className={styles.leftPanel}>
          <LocationScene location={narrative.location} />
          <MiniMap location={narrative.location} />
          <StatusIcons
            statusEffects={player.statusEffects}
            hazards={narrative.hazards}
          />
        </div>

        {/* Right panel */}
        <div className={styles.rightPanel}>
          {ui.loading ? (
            <div className={styles.loadingState}>
              <div className="spinner spinner-lg" />
              <span className={styles.loadingText}>CONNECTING TO MARS NETWORK...</span>
            </div>
          ) : (
            <>
              {combat.active ? (
                <CombatPanel onStateUpdate={loadGameState} />
              ) : (
                <NarrativePanel onStateUpdate={loadGameState} />
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <ActionBar
        onToggleEvidence={toggleEvidenceBoard}
        onRest={handleRest}
        evidenceCount={evidence.collected.length}
        evidenceTotal={evidence.total}
      />

      {/* ── Modals / Overlays ── */}
      {ui.evidenceBoardOpen && <EvidenceBoard onClose={toggleEvidenceBoard} />}
      {ui.isRolling && <DiceOverlay />}

      {/* Error toast */}
      {ui.error && (
        <div className={styles.errorToast} onClick={() => useGameStore.getState().clearError()}>
          <span>⚠</span>
          <span>{ui.error}</span>
          <span className={styles.errorClose}>✕</span>
        </div>
      )}
    </div>
  )
}
