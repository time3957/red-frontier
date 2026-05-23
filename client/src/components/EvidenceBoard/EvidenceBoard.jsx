import { useEffect, useState, useRef } from 'react'
import useGameStore from '../../store/gameStore'
import { evidence as evidenceApi } from '../../api/gameApi'
import styles from './EvidenceBoard.module.css'

export default function EvidenceBoard({ onClose }) {
  const { evidence, setEvidenceState, setError } = useGameStore()
  const [selectedClue, setSelectedClue] = useState(null)
  const [loading, setLoading] = useState(false)
  const boardRef = useRef(null)

  // Track card elements positions for drawing connection lines
  const [cardPositions, setCardPositions] = useState({})

  const fetchBoard = async () => {
    setLoading(true)
    try {
      const res = await evidenceApi.getBoard()
      if (res.data) {
        setEvidenceState(res.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'FAILED TO FETCH EVIDENCE BOARD')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBoard()
  }, [])

  // Recalculate card coordinates for connection lines
  useEffect(() => {
    if (!loading && evidence.board?.length > 0) {
      const timer = setTimeout(() => {
        const boardEl = boardRef.current
        if (!boardEl) return

        const boardRect = boardEl.getBoundingClientRect()
        const positions = {}

        evidence.board.forEach((clue) => {
          const cardEl = document.getElementById(`clue-card-${clue.clueId}`)
          if (cardEl) {
            const cardRect = cardEl.getBoundingClientRect()
            positions[clue.clueId] = {
              x: cardRect.left - boardRect.left + cardRect.width / 2,
              y: cardRect.top - boardRect.top + cardRect.height / 2,
            }
          }
        })
        setCardPositions(positions)
      }, 500) // Delay to ensure DOM is fully rendered

      return () => clearTimeout(timer)
    }
  }, [loading, evidence.board, evidence.collected])

  const isCollected = (clueId) => {
    return evidence.collected?.includes(clueId)
  }

  // Generate connection threads between cards
  const renderConnections = () => {
    const lines = []
    if (!evidence.board) return null

    evidence.board.forEach((clue) => {
      const fromPos = cardPositions[clue.clueId]
      if (!fromPos || !isCollected(clue.clueId)) return

      clue.connectsTo?.forEach((targetId) => {
        const toPos = cardPositions[targetId]
        if (!toPos || !isCollected(targetId)) return

        // To prevent duplicate lines (e.g. A->B and B->A), sort the key
        const lineKey = [clue.clueId, targetId].sort().join('-')

        lines.push(
          <line
            key={lineKey}
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            className={styles.thread}
          />
        )
      })
    })

    return (
      <svg className={styles.connectionsSvg}>
        {lines}
      </svg>
    )
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.pulsingDot} />
            EVIDENCE CORRELATION BOARD
          </div>
          <div className={styles.progressSection}>
            <span className={styles.progressLabel}>DISCOVERY PROGRESS:</span>
            <div className={styles.progressBarBg}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${evidence.completionPercent || 0}%` }}
              />
            </div>
            <span className={styles.progressPercent}>
              {evidence.collected?.length || 0} / {evidence.total || 12} ({evidence.completionPercent || 0}%)
            </span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Board Body */}
        <div className={styles.boardContainer}>
          <div className={styles.corkBoard} ref={boardRef}>
            {/* Draw red strings / lines */}
            {Object.keys(cardPositions).length > 0 && renderConnections()}

            {loading ? (
              <div className={styles.boardLoading}>
                <div className="spinner" />
                <span className={styles.loadingText}>DECRYPTING COGNITIVE NETWORKS...</span>
              </div>
            ) : (
              <div className={styles.cardsGrid}>
                {evidence.board?.map((clue) => {
                  const collected = isCollected(clue.clueId)
                  return (
                    <div
                      key={clue.clueId}
                      id={`clue-card-${clue.clueId}`}
                      className={`${styles.card} ${collected ? styles.collectedCard : styles.uncollectedCard}`}
                      onClick={() => collected && setSelectedClue(clue)}
                    >
                      <div className={styles.pin} />
                      {collected ? (
                        <>
                          <div className={styles.cardHeader}>
                            <span className={`${styles.badge} ${styles[`badge_${clue.type}`]}`}>
                              {clue.type?.toUpperCase()}
                            </span>
                            <span className={styles.clueId}>#{clue.clueId}</span>
                          </div>
                          <h3 className={styles.cardTitle}>{clue.title}</h3>
                          <p className={styles.cardDesc}>{clue.description}</p>
                          <div className={styles.examinePrompt}>CLICK TO EXAMINE</div>
                        </>
                      ) : (
                        <div className={styles.classifiedContent}>
                          <div className={styles.classifiedHeader}>
                            <span>CLASSIFIED</span>
                            <span>#{clue.clueId}</span>
                          </div>
                          <div className={styles.classifiedIcon}>🔒</div>
                          <div className={styles.classifiedPlaceholder}>
                            [ ENCRYPTED DATA BLOCK ]
                          </div>
                          {clue.location && (
                            <div className={styles.clueHint}>
                              Location hint: {clue.location}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Narrative Layers / Unlocks Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLabel}>// UNLOCKED INTEL LAYERS:</div>
          <div className={styles.layersList}>
            {evidence.narrativeLayers?.length > 0 ? (
              evidence.narrativeLayers.map((layer, index) => (
                <div key={index} className={styles.layerItem}>
                  ◈ {layer}
                </div>
              ))
            ) : (
              <div className={styles.noLayers}>NO INTEL LAYERS UNLOCKED YET. COLLECT MORE EVIDENCE.</div>
            )}
          </div>
        </div>
      </div>

      {/* Clue Details Modal (Examine) */}
      {selectedClue && (
        <div className={styles.detailOverlay} onClick={() => setSelectedClue(null)}>
          <div className={styles.detailCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.detailHeader}>
              <span className={`${styles.badge} ${styles[`badge_${selectedClue.type}`]}`}>
                {selectedClue.type?.toUpperCase()}
              </span>
              <span className={styles.detailClueId}>#{selectedClue.clueId}</span>
              <button className={styles.detailCloseBtn} onClick={() => setSelectedClue(null)}>✕</button>
            </div>
            <h2 className={styles.detailTitle}>{selectedClue.title}</h2>
            <div className={styles.detailMeta}>
              <span><strong>LOCATION:</strong> {selectedClue.location}</span>
              <span><strong>ACT:</strong> {selectedClue.act}</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.detailContent}>
              <p className={styles.detailDesc}>{selectedClue.description}</p>
              {selectedClue.fullText && (
                <div className={styles.fullTextContainer}>
                  <div className={styles.fullTextLabel}>[ TRANSCRIBED DATA ]</div>
                  <p className={styles.detailFullText}>{selectedClue.fullText}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
