import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useGameStore from '../store/gameStore'
import { character as charApi } from '../api/gameApi'
import styles from './CharacterCreate.module.css'

// ─── Class Definitions ──────────────────────────────────
const CLASSES = [
  {
    id: 'ranger',
    icon: '🎯',
    name: 'RANGER',
    role: 'Special Operations',
    tagline: 'Hunt or be hunted on the Martian frontier',
    stats: { STR: 12, DEX: 16, CON: 12, INT: 10, WIS: 10 },
    ability: 'Tactical Intel',
    abilityDesc: 'Scan enemies before combat to reveal weaknesses and reduce their initiative by 2.',
    color: '#e85c20',
    badgeColor: 'badge-accent',
    traits: ['Combat Expert', 'Recon', 'Survival'],
  },
  {
    id: 'scientist',
    icon: '🔬',
    name: 'SCIENTIST',
    role: 'Areologist',
    tagline: 'Knowledge is the only armor that never runs out',
    stats: { STR: 8, DEX: 10, CON: 10, INT: 18, WIS: 14 },
    ability: 'Science Analysis',
    abilityDesc: 'Analyze environmental hazards and alien artifacts, unlocking hidden dialogue and solutions.',
    color: '#2a7abf',
    badgeColor: 'badge-blue',
    traits: ['Researcher', 'Tech Savvy', 'Medical'],
  },
  {
    id: 'engineer',
    icon: '🔧',
    name: 'ENGINEER',
    role: 'Demolitions Expert',
    tagline: 'Fix it, blow it up, or reroute it — your call',
    stats: { STR: 14, DEX: 12, CON: 12, INT: 16, WIS: 10 },
    ability: 'System Repair',
    abilityDesc: 'Repair broken equipment and hack facility systems. Restore SI +4 outside combat once per rest.',
    color: '#c88a20',
    badgeColor: 'badge-yellow',
    traits: ['Mechanic', 'Hacker', 'Explosives'],
  },
  {
    id: 'medic',
    icon: '💉',
    name: 'MEDIC',
    role: 'Trauma Surgeon',
    tagline: 'Keep them alive long enough to make a difference',
    stats: { STR: 10, DEX: 12, CON: 13, INT: 14, WIS: 16 },
    ability: 'Emergency Surgery',
    abilityDesc: 'Stabilize critical injuries in the field. Restore HP to self or ally — 1d8+WIS once per scene.',
    color: '#3a9e6a',
    badgeColor: 'badge-green',
    traits: ['Healer', 'Chemistry', 'Crisis Expert'],
  },
  {
    id: 'augmented',
    icon: '🦾',
    name: 'AUGMENTED',
    role: 'Neural Hacker',
    tagline: 'Half machine, fully dangerous — but at what cost?',
    stats: { STR: 12, DEX: 14, CON: 10, INT: 14, WIS: 10 },
    ability: 'Dual Neural Hack',
    abilityDesc: 'Simultaneously interface with two systems or control a cybernetic enemy for 1 round. HumanityIndex: 80%.',
    color: '#8a4abf',
    badgeColor: 'badge-purple',
    traits: ['Cyborg', 'Neural Link', 'EMP Immune'],
    special: 'HumanityIndex: 80%',
  },
]

// ─── Stat Row ────────────────────────────────────────────
function StatRow({ label, value, max = 18 }) {
  const pct = (value / max) * 100
  return (
    <div className={styles.statRow}>
      <span className={styles.statLabel}>{label}</span>
      <div className={styles.statTrack}>
        <div className={styles.statFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.statValue}>{value}</span>
    </div>
  )
}

// ─── Class Card ──────────────────────────────────────────
function ClassCard({ cls, selected, onSelect }) {
  return (
    <div
      className={`${styles.classCard} ${selected ? styles.classSelected : ''}`}
      onClick={() => onSelect(cls.id)}
      style={{ '--cls-color': cls.color }}
    >
      <div className={styles.classGlow} />
      <div className={styles.classIcon}>{cls.icon}</div>
      <div className={styles.classInfo}>
        <div className={styles.className}>{cls.name}</div>
        <div className={styles.classRole}>{cls.role}</div>
        <div className={styles.classTagline}>{cls.tagline}</div>
      </div>
      <div className={styles.classStats}>
        {Object.entries(cls.stats).map(([k, v]) => (
          <StatRow key={k} label={k} value={v} />
        ))}
      </div>
      <div className={styles.classAbility}>
        <div className={styles.classAbilityLabel}>SPECIAL ABILITY</div>
        <div className={styles.classAbilityName}>{cls.ability}</div>
        <div className={styles.classAbilityDesc}>{cls.abilityDesc}</div>
      </div>
      <div className={styles.classTraits}>
        {cls.traits.map(t => (
          <span key={t} className={`badge ${cls.badgeColor}`}>{t}</span>
        ))}
        {cls.special && (
          <span className="badge badge-purple">{cls.special}</span>
        )}
      </div>
      {selected && <div className={styles.selectedIndicator}>▶ SELECTED</div>}
    </div>
  )
}

// ─── Character Create Page ───────────────────────────────
export default function CharacterCreate() {
  const navigate = useNavigate()
  const { setPlayerState, toggleSettings } = useGameStore()

  const [step, setStep]               = useState(1)
  const [charName, setCharName]       = useState('')
  const [selectedClass, setSelectedClass] = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [animOut, setAnimOut]         = useState(false)

  const selectedClassData = CLASSES.find(c => c.id === selectedClass)

  const goStep = (next) => {
    setAnimOut(true)
    setTimeout(() => {
      setStep(next)
      setAnimOut(false)
    }, 200)
  }

  const handleSubmit = async () => {
    if (!charName.trim() || !selectedClass) return
    setLoading(true)
    setError('')
    try {
      const res = await charApi.create({ name: charName.trim(), class: selectedClass })
      setPlayerState(res.data)
      navigate('/game')
    } catch (err) {
      const msg = err.response?.data?.message || 'INITIALIZATION FAILED'
      setError(msg.toUpperCase())
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Background */}
      <div className={styles.bg} />
      <div className={styles.bgGrid} />
      <div className={`scan-line`} />

      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLogo}>RED FRONTIER</div>
        <div className={styles.topBarTitle}>// IDENTITY INITIALIZATION</div>
        <div className={styles.topBarActions}>
          <button 
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 10px', fontSize: '0.65rem' }}
            onClick={toggleSettings}
            title="ตั้งค่าแสดงผลและความสว่าง"
          >
            ⚙ ACCESSIBILITY
          </button>
          <span className={styles.topBarVersion}>GDD v4.0</span>
        </div>
      </div>

      {/* Step indicator */}
      <div className={styles.stepIndicator}>
        {[1, 2, 3].map(n => (
          <div key={n} className={styles.stepItem}>
            <div className={`${styles.stepCircle} ${step >= n ? styles.stepActive : ''} ${step === n ? styles.stepCurrent : ''}`}>
              {step > n ? '✓' : n}
            </div>
            <span className={`${styles.stepLabel} ${step >= n ? styles.stepLabelActive : ''}`}>
              {n === 1 ? 'NAME' : n === 2 ? 'CLASS' : 'CONFIRM'}
            </span>
            {n < 3 && <div className={`${styles.stepLine} ${step > n ? styles.stepLineActive : ''}`} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className={`${styles.content} ${animOut ? styles.animOut : styles.animIn}`}>

        {/* ── STEP 1: Name ── */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNum}>01</div>
              <div>
                <h2 className={styles.stepTitle}>COLONIST DESIGNATION</h2>
                <p className={styles.stepSubtitle}>Enter your identity. This cannot be changed.</p>
              </div>
            </div>
            <div className={`card-glass ${styles.formCard}`}>
              <label className="input-label">COLONIST NAME</label>
              <input
                type="text"
                className={`input-field ${styles.nameInput}`}
                placeholder="Enter designation..."
                value={charName}
                onChange={e => setCharName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && charName.trim() && goStep(2)}
                maxLength={24}
                autoFocus
                spellCheck={false}
              />
              <div className={styles.nameCounter}>{charName.length}/24</div>
              <div className={styles.namePreview}>
                {charName ? (
                  <>
                    <span className={styles.namePreviewLabel}>PREVIEW:</span>
                    <span className={styles.namePreviewValue}>{charName.toUpperCase()}</span>
                    <span className={styles.namePreviewSuffix}>— COLONIST #847</span>
                  </>
                ) : (
                  <span className={styles.namePreviewPlaceholder}>Awaiting designation...</span>
                )}
              </div>
            </div>
            <div className={styles.stepActions}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => goStep(2)}
                disabled={!charName.trim()}
              >
                NEXT: SELECT CLASS ▶
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Class Selection ── */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNum}>02</div>
              <div>
                <h2 className={styles.stepTitle}>OPERATIONAL SPECIALTY</h2>
                <p className={styles.stepSubtitle}>Your class determines your starting stats and special ability.</p>
              </div>
            </div>
            <div className={styles.classGrid}>
              {CLASSES.map(cls => (
                <ClassCard
                  key={cls.id}
                  cls={cls}
                  selected={selectedClass === cls.id}
                  onSelect={setSelectedClass}
                />
              ))}
            </div>
            <div className={styles.stepActions}>
              <button className="btn btn-secondary" onClick={() => goStep(1)}>◀ BACK</button>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => goStep(3)}
                disabled={!selectedClass}
              >
                NEXT: CONFIRM ▶
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirm ── */}
        {step === 3 && selectedClassData && (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNum}>03</div>
              <div>
                <h2 className={styles.stepTitle}>CONFIRM IDENTITY</h2>
                <p className={styles.stepSubtitle}>Review your profile before deployment to Mars.</p>
              </div>
            </div>

            <div className={`card-glass ${styles.confirmCard}`}>
              {/* Header */}
              <div className={styles.confirmHeader} style={{ borderColor: selectedClassData.color }}>
                <div className={styles.confirmIcon}>{selectedClassData.icon}</div>
                <div className={styles.confirmIdentity}>
                  <div className={styles.confirmName}>{charName.toUpperCase()}</div>
                  <div className={styles.confirmClass} style={{ color: selectedClassData.color }}>
                    {selectedClassData.name} — {selectedClassData.role}
                  </div>
                  <div className={styles.confirmTagline}>{selectedClassData.tagline}</div>
                </div>
                <div className={styles.confirmBadge}>
                  <div className={styles.confirmBadgeLine}>COLONIST #847</div>
                  <div className={styles.confirmBadgeLine}>CLEARANCE LVL 1</div>
                  <div className={styles.confirmBadgeLine}>A.D. 2080</div>
                </div>
              </div>

              <div className={styles.confirmDivider} />

              {/* Stats */}
              <div className={styles.confirmStats}>
                <div className={styles.confirmStatsTitle}>BASE ATTRIBUTES</div>
                <div className={styles.confirmStatsGrid}>
                  {Object.entries(selectedClassData.stats).map(([k, v]) => (
                    <div key={k} className={styles.confirmStat}>
                      <span className={styles.confirmStatLabel}>{k}</span>
                      <span className={styles.confirmStatValue} style={{ color: selectedClassData.color }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.confirmDivider} />

              {/* Special Ability */}
              <div className={styles.confirmAbility}>
                <div className={styles.confirmAbilityLabel}>SPECIAL ABILITY</div>
                <div className={styles.confirmAbilityName}>{selectedClassData.ability}</div>
                <div className={styles.confirmAbilityDesc}>{selectedClassData.abilityDesc}</div>
              </div>

              <div className={styles.confirmDivider} />

              {/* Starting Resources */}
              <div className={styles.confirmResources}>
                <div className={styles.confirmResourcesTitle}>STARTING RESOURCES</div>
                <div className={styles.confirmResourceGrid}>
                  <div className={styles.confirmResource}><span>HP</span><span>10/10</span></div>
                  <div className={styles.confirmResource}><span>SI</span><span>6/6</span></div>
                  <div className={styles.confirmResource}><span>O₂</span><span>100%</span></div>
                  <div className={styles.confirmResource}><span>PWR</span><span>3</span></div>
                  <div className={styles.confirmResource}><span>RAD</span><span>0</span></div>
                  <div className={styles.confirmResource}><span>SAN</span><span>80/100</span></div>
                  {selectedClassData.special && (
                    <div className={styles.confirmResource}><span>HUM</span><span>80%</span></div>
                  )}
                </div>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className={styles.stepActions}>
              <button className="btn btn-secondary" onClick={() => goStep(2)}>◀ BACK</button>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> DEPLOYING TO MARS...</>
                ) : '▶ BEGIN MISSION'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
