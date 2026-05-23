import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useGameStore from '../store/gameStore'
import { auth, character } from '../api/gameApi'
import styles from './LandingPage.module.css'

// ─── Animated background particles ──────────────────────
function Particle({ style }) {
  return <div className={styles.particle} style={style} />
}

function BackgroundParticles() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 12}s`,
    animationDuration: `${12 + Math.random() * 16}s`,
    width: `${1 + Math.random() * 2}px`,
    height: `${20 + Math.random() * 60}px`,
    opacity: 0.1 + Math.random() * 0.3,
    '--drift': `${(Math.random() - 0.5) * 80}px`,
  }))
  return (
    <div className={styles.particles}>
      {particles.map(({ id, ...style }) => (
        <Particle key={id} style={style} />
      ))}
    </div>
  )
}

// ─── Main Landing Page ───────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const { setAuth, toggleSettings } = useGameStore()

  const [mode, setMode]       = useState('login')   // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [glitchActive, setGlitchActive] = useState(false)
  const titleRef = useRef(null)

  // Redirect if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('rf_token')
    if (token) navigate('/game')
  }, [navigate])

  // Random title glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true)
      setTimeout(() => setGlitchActive(false), 150)
    }, 5000 + Math.random() * 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'register') {
        const res = await auth.register({ username, password, email })
        const { token, user } = res.data
        setAuth(token, user)
        setSuccess('ACCOUNT CREATED — INITIALIZING COLONIST PROFILE...')
        setTimeout(() => navigate('/create'), 1200)
      } else {
        const res = await auth.login({ username, password })
        const { token, user } = res.data
        setAuth(token, user)

        // Check if user already has a character
        try {
          const charRes = await character.getState()
          if (charRes.data?.name) {
            setSuccess('IDENTITY VERIFIED — RECONNECTING TO MARS NETWORK...')
            setTimeout(() => navigate('/game'), 1200)
          } else {
            setSuccess('IDENTITY VERIFIED — INITIALIZING COLONIST PROFILE...')
            setTimeout(() => navigate('/create'), 1200)
          }
        } catch {
          setTimeout(() => navigate('/create'), 1200)
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'CONNECTION FAILED — RETRY'
      setError(msg.toUpperCase())
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setError('')
    setSuccess('')
    setUsername('')
    setPassword('')
    setEmail('')
  }

  return (
    <div className={styles.page}>
      {/* Floating settings button */}
      <button
        onClick={toggleSettings}
        className={styles.settingsFloatingBtn}
        title="ตั้งค่าแสดงผลและความสว่าง"
      >
        ⚙ ACCESSIBILITY
      </button>
      {/* Animated background */}
      <div className={styles.bg} />
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />
      <div className={styles.bgGrid} />
      <BackgroundParticles />

      {/* Scan lines */}
      <div className={`scan-line ${styles.scanLine1}`} />
      <div className={`scan-line scan-line-slow ${styles.scanLine2}`} />

      {/* Vignette */}
      <div className={styles.vignette} />

      {/* ── CONTENT ── */}
      <div className={styles.content}>

        {/* Left / Hero section */}
        <div className={styles.hero}>
          <div className={styles.heroBadge}>
            <span className={`status-dot online`} />
            <span className={styles.heroBadgeText}>MARS COLONIAL NETWORK — UPLINK ACTIVE</span>
          </div>

          <h1
            ref={titleRef}
            className={`${styles.title} ${glitchActive ? styles.titleGlitch : ''}`}
            data-text="RED FRONTIER"
          >
            RED FRONTIER
          </h1>

          <div className={styles.subtitle}>
            MARS SURVIVAL RPG — A.D. 2080
          </div>

          <div className={styles.quoteBlock}>
            <div className={styles.quoteDecor}>▋</div>
            <blockquote className={styles.quote}>
              คุณไม่ได้ถูกล่าเพราะคุณเป็นใคร<br />
              — แต่เพราะคุณรู้อะไรบางอย่าง
            </blockquote>
          </div>

          <div className={styles.loreStats}>
            <div className={styles.loreStat}>
              <span className={styles.loreStatVal}>847</span>
              <span className={styles.loreStatLabel}>COLONISTS</span>
            </div>
            <div className={styles.loreStatDivider} />
            <div className={styles.loreStat}>
              <span className={styles.loreStatVal}>12</span>
              <span className={styles.loreStatLabel}>CONSPIRACIES</span>
            </div>
            <div className={styles.loreStatDivider} />
            <div className={styles.loreStat}>
              <span className={styles.loreStatVal}>0</span>
              <span className={styles.loreStatLabel}>SURVIVORS</span>
            </div>
          </div>

          <div className={styles.versionBadge}>
            <span>GDD v4.0 — PRODUCTION</span>
            <span className={styles.versionDot} />
            <span>BUILD 2080.05.23</span>
          </div>
        </div>

        {/* Right / Auth Card */}
        <div className={styles.authWrapper}>
          <div className={`card-glass ${styles.authCard}`}>
            {/* Card header decorative */}
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLine} />
              <span className={styles.cardHeaderText}>
                {mode === 'login' ? '// IDENTITY VERIFICATION' : '// COLONIST REGISTRATION'}
              </span>
              <div className={styles.cardHeaderLine} />
            </div>

            {/* Mode toggle */}
            <div className={styles.modeToggle}>
              <button
                className={`${styles.modeBtn} ${mode === 'login' ? styles.modeActive : ''}`}
                onClick={() => switchMode('login')}
              >
                SIGN IN
              </button>
              <button
                className={`${styles.modeBtn} ${mode === 'register' ? styles.modeActive : ''}`}
                onClick={() => switchMode('register')}
              >
                REGISTER
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={`input-group ${styles.inputGroup}`}>
                <label className="input-label">COLONIST ID</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  spellCheck={false}
                />
              </div>

              {mode === 'register' && (
                <div className={`input-group ${styles.inputGroup} ${styles.slideIn}`}>
                  <label className="input-label">EMAIL (OPTIONAL)</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="colonist@olympus.mars"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              )}

              <div className={`input-group ${styles.inputGroup}`}>
                <label className="input-label">ACCESS CODE</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>

              {error && (
                <div className={`alert alert-error ${styles.alertMsg}`}>
                  ⚠ {error}
                </div>
              )}
              {success && (
                <div className={`alert alert-success ${styles.alertMsg}`}>
                  ✓ {success}
                </div>
              )}

              <button
                type="submit"
                className={`btn btn-primary btn-lg ${styles.submitBtn}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    AUTHENTICATING...
                  </>
                ) : mode === 'login' ? (
                  '▶ ACCESS MARS NETWORK'
                ) : (
                  '▶ REGISTER COLONIST'
                )}
              </button>
            </form>

            <div className={styles.cardFooter}>
              <span className={styles.footerText}>SECURE UPLINK · ENCRYPTED · BCRYPT-12</span>
            </div>

            {/* Decorative corners */}
            <div className={styles.cornerTL} />
            <div className={styles.cornerBR} />
          </div>

          {/* Floating warning */}
          <div className={styles.warningBadge}>
            <span>⚠</span>
            <span>AUTHORIZATION REQUIRED — OLYMPUS BASE CLEARANCE LEVEL 1+</span>
          </div>
        </div>
      </div>

      {/* Mars planet decoration */}
      <div className={styles.marsDecor}>
        <div className={styles.marsOrbit} />
        <div className={styles.marsCore} />
        <div className={styles.marsGlow} />
      </div>
    </div>
  )
}
