import { useNavigate } from 'react-router-dom'
import useGameStore from '../../store/gameStore'
import styles from './HUD.module.css'

// ─── Resource Bar Component ──────────────────────────────
function ResourceBar({ id, icon, label, current, max, colorClass, critical = false, warn = false }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0
  const isCritical = critical || pct <= 20
  const isWarn = warn || (pct <= 40 && pct > 20)

  return (
    <div className={`${styles.resourceBar} resource-bar-container`}
      title={`${label}: ${current}/${max}`}
    >
      <div className={styles.barIconLabel}>
        <span className={styles.barIcon}>{icon}</span>
        <span className={`resource-bar-label ${styles.barLabel}`}>{label}</span>
      </div>
      <div className={`resource-bar-track ${styles.barTrack}`}>
        <div
          className={`resource-bar-fill bar-${id} ${isCritical ? 'bar-critical' : ''} ${isWarn ? 'bar-high' : ''} ${styles.barFill}`}
          style={{ width: `${pct}%` }}
        />
        {/* Segment tick marks */}
        {[25, 50, 75].map(tick => (
          <div key={tick} className={styles.barTick} style={{ left: `${tick}%` }} />
        ))}
      </div>
      <span className={`resource-bar-value ${styles.barValue}`}>
        {typeof current === 'number' ? Math.round(current) : current}
        {max && <span className={styles.barMax}>/{max}</span>}
      </span>
      {isCritical && <div className={styles.critIndicator} />}
    </div>
  )
}

// ─── Radiation Bar (inverted — higher = worse) ──────────
function RadiationBar({ value }) {
  const pct = Math.max(0, Math.min(100, value))
  const isCritical = pct >= 60
  const isWarn = pct >= 30 && pct < 60

  return (
    <div className={`${styles.resourceBar} resource-bar-container`} title={`Radiation: ${value} rads`}>
      <div className={styles.barIconLabel}>
        <span className={styles.barIcon}>☢</span>
        <span className={`resource-bar-label ${styles.barLabel}`}>RAD</span>
      </div>
      <div className={`resource-bar-track ${styles.barTrack}`}>
        <div
          className={`resource-bar-fill bar-rad ${isCritical ? 'bar-critical' : ''} ${isWarn ? 'bar-high' : ''} ${styles.barFill}`}
          style={{ width: `${pct}%` }}
        />
        {[25, 50, 75].map(tick => (
          <div key={tick} className={styles.barTick} style={{ left: `${tick}%` }} />
        ))}
      </div>
      <span className={`resource-bar-value ${styles.barValue}`}>
        {Math.round(pct)}
        <span className={styles.barMax}>%</span>
      </span>
      {isCritical && <div className={styles.critIndicator} />}
    </div>
  )
}

// ─── HUD Component ───────────────────────────────────────
export default function HUD() {
  const navigate = useNavigate()
  const { player, narrative, evidence, toggleSettings, logout } = useGameStore()

  const { hp, si, o2, pc, radiation, sanity } = player

  const o2Pct = o2.max > 0 ? (o2.current / o2.max) * 100 : 100
  const o2Critical = o2Pct <= 25

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const classColors = {
    ranger: 'var(--accent)',
    scientist: 'var(--blue)',
    engineer: 'var(--yellow)',
    medic: 'var(--green)',
    augmented: 'var(--purple)',
  }
  const classColor = classColors[player.class?.toLowerCase()] || 'var(--accent)'

  return (
    <div className={`hud-bar ${styles.hud}`}>
      {/* Left — Character Identity */}
      <div className={styles.identity}>
        <div className={styles.charName}>{player.name || 'UNKNOWN'}</div>
        <div className={styles.charMeta}>
          {player.class && (
            <span className={styles.classBadge} style={{ borderColor: classColor, color: classColor }}>
              {player.class.toUpperCase()}
            </span>
          )}
          <span className={styles.charLevel}>LVL {player.level}</span>
          <span className={styles.charXp}>◈ {player.xp} XP</span>
          <span className={styles.charCredits}>₡{player.credits}</span>
        </div>
      </div>

      {/* Center — Resource Bars */}
      <div className={styles.bars}>
        {/* HP */}
        <ResourceBar
          id="hp"
          icon="♥"
          label="HP"
          current={hp.current}
          max={hp.max}
          colorClass="bar-hp"
        />
        {/* SI */}
        <ResourceBar
          id="si"
          icon="⬡"
          label="SI"
          current={si.current}
          max={si.max}
          colorClass="bar-si"
        />
        {/* O2 */}
        <ResourceBar
          id="o2"
          icon="◉"
          label="O₂"
          current={o2.current}
          max={o2.max}
          colorClass="bar-o2"
          critical={o2Critical}
        />
        {/* Power Cell */}
        <div className={`${styles.resourceBar} resource-bar-container`} title={`Power Cells: ${pc.current}/${pc.max}`}>
          <div className={styles.barIconLabel}>
            <span className={styles.barIcon}>⚡</span>
            <span className={`resource-bar-label ${styles.barLabel}`}>PWR</span>
          </div>
          <div className={styles.pcDots}>
            {Array.from({ length: pc.max }, (_, i) => (
              <div
                key={i}
                className={`${styles.pcDot} ${i < pc.current ? styles.pcDotFull : styles.pcDotEmpty}`}
              />
            ))}
          </div>
          <span className={`resource-bar-value ${styles.barValue}`}>
            {pc.current}<span className={styles.barMax}>/{pc.max}</span>
          </span>
        </div>
        {/* Radiation */}
        <RadiationBar value={radiation} />
        {/* Sanity */}
        <ResourceBar
          id="sanity"
          icon="◬"
          label="SAN"
          current={sanity.current}
          max={sanity.max}
          colorClass="bar-sanity"
        />
        {/* HumanityIndex for Augmented */}
        {player.class?.toLowerCase() === 'augmented' && (
          <div className={`${styles.resourceBar} resource-bar-container`} title={`Humanity Index: ${player.humanityIndex}%`}>
            <div className={styles.barIconLabel}>
              <span className={styles.barIcon}>🦾</span>
              <span className={`resource-bar-label ${styles.barLabel}`}>HUM</span>
            </div>
            <div className={`resource-bar-track ${styles.barTrack}`}>
              <div
                className={`resource-bar-fill ${styles.barFill}`}
                style={{
                  width: `${player.humanityIndex}%`,
                  background: 'linear-gradient(90deg, #4a1a6a, var(--purple), #ff80ff)',
                }}
              />
            </div>
            <span className={`resource-bar-value ${styles.barValue}`}>
              {player.humanityIndex}<span className={styles.barMax}>%</span>
            </span>
          </div>
        )}
      </div>

      {/* Right — Location + Evidence + Logout */}
      <div className={styles.rightSection}>
        {/* O2 Alert badge */}
        {o2Critical && (
          <div className={styles.o2Alert}>
            <span>⚠ LOW O₂</span>
          </div>
        )}

        {/* Location */}
        <div className={styles.locationBadge}>
          <span className={styles.locationIcon}>◈</span>
          <span className={styles.locationText} title={narrative.location}>
            {narrative.location?.length > 22
              ? narrative.location.slice(0, 22) + '…'
              : narrative.location}
          </span>
        </div>

        {/* Evidence */}
        <div className={styles.evidenceBadge}>
          <span className={styles.evidenceLabel}>CLUES</span>
          <span className={styles.evidenceCount}>
            {evidence.collected.length}/{evidence.total}
          </span>
        </div>

        {/* Settings */}
        <button className={`btn btn-ghost btn-sm ${styles.settingsBtn}`} onClick={toggleSettings} title="ปรับความสว่างและขนาดตัวอักษร">
          ⚙ SETTINGS
        </button>

        {/* Logout */}
        <button className={`btn btn-ghost btn-sm ${styles.logoutBtn}`} onClick={handleLogout}>
          ⬡ EXIT
        </button>
      </div>
    </div>
  )
}
