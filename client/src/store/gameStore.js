import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

const useGameStore = create(
  immer((set, get) => ({
    // ─── Auth ─────────────────────────────────────────────
    auth: {
      token: localStorage.getItem('rf_token') || null,
      user: (() => {
        try { return JSON.parse(localStorage.getItem('rf_user') || 'null') } catch { return null }
      })(),
      isAuthenticated: !!localStorage.getItem('rf_token'),
    },

    // ─── Player ───────────────────────────────────────────
    player: {
      name: '',
      class: '',
      level: 1,
      xp: 0,
      credits: 100,
      hp: { current: 10, max: 10 },
      si: { current: 6, max: 6 },       // Shield Integrity
      o2: { current: 100, max: 100 },   // Oxygen %
      pc: { current: 3, max: 3 },       // Power Cells
      radiation: 0,                      // Rads (0–100)
      sanity: { current: 80, max: 100 },
      humanityIndex: 100,                // For Augmented class
      stats: {
        str: 10, dex: 10, con: 10,
        int: 10, wis: 10, cha: 10,
      },
      inventory: [],
      statusEffects: [],
    },

    // ─── Narrative ────────────────────────────────────────
    narrative: {
      currentNode: null,
      nodeText: '',
      choices: [],
      location: 'Olympus Base — Airlock Alpha',
      atmosphere: 'calm', // calm | tense | horror | action
      hazards: [],
      visitedNodes: [],
    },

    // ─── Combat ───────────────────────────────────────────
    combat: {
      active: false,
      round: 1,
      turn: 'player',
      enemies: [],
      playerStatus: { hp: 10, si: 6, statusEffects: [] },
      log: [],
      initiativeOrder: [],
      lastResult: null,
    },

    // ─── Evidence ─────────────────────────────────────────
    evidence: {
      collected: [],
      total: 13,
      completionPercent: 0,
      connections: [],
      narrativeLayers: [],
      board: [],
    },

    // ─── UI ───────────────────────────────────────────────
    ui: {
      isRolling: false,
      diceResult: null,   // { roll, type, outcome, narrative }
      screenShake: false,
      o2Alert: false,
      loading: false,
      error: null,
      evidenceBoardOpen: false,
      settingsOpen: false,
      accessibility: {
        brightness: parseFloat(localStorage.getItem('rf_brightness') || '1.0'),
        fontSize: parseFloat(localStorage.getItem('rf_fontSize') || '1.0'),
        contrast: parseFloat(localStorage.getItem('rf_contrast') || '1.0'),
      },
    },

    // ────────────────────────────────────────────────────────
    //  ACTIONS
    // ────────────────────────────────────────────────────────

    // ─── Auth Actions ─────────────────────────────────────
    setAuth: (token, user) => set((state) => {
      state.auth.token = token
      state.auth.user = user
      state.auth.isAuthenticated = true
      localStorage.setItem('rf_token', token)
      localStorage.setItem('rf_user', JSON.stringify(user))
    }),

    logout: () => set((state) => {
      state.auth.token = null
      state.auth.user = null
      state.auth.isAuthenticated = false
      localStorage.removeItem('rf_token')
      localStorage.removeItem('rf_user')
      // Reset game state on logout
      state.player = useGameStore.getInitialState().player
      state.narrative = useGameStore.getInitialState().narrative
      state.combat = useGameStore.getInitialState().combat
      state.evidence = useGameStore.getInitialState().evidence
    }),

    // ─── Player Actions ───────────────────────────────────
    setPlayerState: (playerData) => set((state) => {
      if (!playerData) return
      const p = state.player

      if (playerData.name !== undefined)   p.name = playerData.name
      if (playerData.class !== undefined)  p.class = playerData.class
      if (playerData.level !== undefined)  p.level = playerData.level
      if (playerData.xp !== undefined)     p.xp = playerData.xp
      if (playerData.credits !== undefined) p.credits = playerData.credits
      if (playerData.hp !== undefined)     p.hp = playerData.hp
      if (playerData.si !== undefined)     p.si = playerData.si
      if (playerData.o2 !== undefined)     p.o2 = playerData.o2
      if (playerData.pc !== undefined)     p.pc = playerData.pc
      if (playerData.radiation !== undefined) p.radiation = playerData.radiation
      if (playerData.sanity !== undefined) p.sanity = playerData.sanity
      if (playerData.humanityIndex !== undefined) p.humanityIndex = playerData.humanityIndex
      if (playerData.stats !== undefined)  p.stats = { ...p.stats, ...playerData.stats }
      if (playerData.inventory !== undefined) p.inventory = playerData.inventory
      if (playerData.statusEffects !== undefined) p.statusEffects = playerData.statusEffects

      // Auto-trigger O2 alert
      const o2Pct = p.o2.current / p.o2.max * 100
      state.ui.o2Alert = o2Pct <= 25
    }),

    // ─── Narrative Actions ────────────────────────────────
    setNarrativeState: (nodeData) => set((state) => {
      if (!nodeData) return
      const n = state.narrative
      if (nodeData.currentNode !== undefined)  n.currentNode = nodeData.currentNode
      if (nodeData.nodeText !== undefined)     n.nodeText = nodeData.nodeText
      if (nodeData.choices !== undefined)      n.choices = nodeData.choices
      if (nodeData.location !== undefined)     n.location = nodeData.location
      if (nodeData.atmosphere !== undefined)   n.atmosphere = nodeData.atmosphere
      if (nodeData.hazards !== undefined)      n.hazards = nodeData.hazards
      if (nodeData.visitedNodes !== undefined) n.visitedNodes = nodeData.visitedNodes
    }),

    // ─── Combat Actions ───────────────────────────────────
    setCombatState: (combatData) => set((state) => {
      if (!combatData) return
      const c = state.combat
      if (combatData.active !== undefined)          c.active = combatData.active
      if (combatData.round !== undefined)           c.round = combatData.round
      if (combatData.turn !== undefined)            c.turn = combatData.turn
      if (combatData.enemies !== undefined)         c.enemies = combatData.enemies
      if (combatData.playerStatus !== undefined)    c.playerStatus = combatData.playerStatus
      if (combatData.initiativeOrder !== undefined) c.initiativeOrder = combatData.initiativeOrder
      if (combatData.lastResult !== undefined)      c.lastResult = combatData.lastResult

      // Append to combat log (max 20 entries)
      if (combatData.logEntry) {
        c.log = [combatData.logEntry, ...c.log].slice(0, 20)
      }
      if (combatData.log !== undefined) {
        c.log = combatData.log
      }
    }),

    // ─── Evidence Actions ─────────────────────────────────
    setEvidenceState: (evidenceData) => set((state) => {
      if (!evidenceData) return
      const e = state.evidence
      if (evidenceData.collected !== undefined)        e.collected = evidenceData.collected
      if (evidenceData.total !== undefined)            e.total = evidenceData.total
      if (evidenceData.connections !== undefined)      e.connections = evidenceData.connections
      if (evidenceData.narrativeLayers !== undefined)  e.narrativeLayers = evidenceData.narrativeLayers
      if (evidenceData.board !== undefined)            e.board = evidenceData.board
      e.completionPercent = Math.round((e.collected.length / e.total) * 100)
    }),

    // ─── UI Actions ───────────────────────────────────────
    triggerDiceRoll: (result) => {
      set((state) => {
        state.ui.isRolling = true
        state.ui.diceResult = result
      })

      // Auto-dismiss after 2.5s
      setTimeout(() => {
        set((state) => {
          state.ui.isRolling = false
        })

        // Trigger screen shake on crit fail
        if (result?.roll === 1 || result?.outcome === 'critFail') {
          get().triggerScreenShake()
        }
      }, 2500)
    },

    triggerScreenShake: () => {
      set((state) => { state.ui.screenShake = true })
      setTimeout(() => {
        set((state) => { state.ui.screenShake = false })
      }, 500)
    },

    setO2Alert: (bool) => set((state) => {
      state.ui.o2Alert = bool
    }),

    setLoading: (bool) => set((state) => {
      state.ui.loading = bool
    }),

    setError: (msg) => set((state) => {
      state.ui.error = msg
    }),

    clearError: () => set((state) => {
      state.ui.error = null
    }),

    toggleEvidenceBoard: () => set((state) => {
      state.ui.evidenceBoardOpen = !state.ui.evidenceBoardOpen
    }),

    toggleSettings: () => set((state) => {
      state.ui.settingsOpen = !state.ui.settingsOpen
    }),

    setAccessibility: (key, value) => set((state) => {
      state.ui.accessibility[key] = value
      localStorage.setItem(`rf_${key}`, value.toString())
    }),
  }))
)

// Store initial state snapshot for reset
useGameStore.getInitialState = () => ({
  player: {
    name: '', class: '', level: 1, xp: 0, credits: 100,
    hp: { current: 10, max: 10 }, si: { current: 6, max: 6 },
    o2: { current: 100, max: 100 }, pc: { current: 3, max: 3 },
    radiation: 0, sanity: { current: 80, max: 100 },
    humanityIndex: 100, stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    inventory: [], statusEffects: [],
  },
  narrative: {
    currentNode: null, nodeText: '', choices: [],
    location: 'Olympus Base — Airlock Alpha', atmosphere: 'calm',
    hazards: [], visitedNodes: [],
  },
  combat: {
    active: false, round: 1, turn: 'player',
    enemies: [], playerStatus: { hp: 10, si: 6, statusEffects: [] },
    log: [], initiativeOrder: [], lastResult: null,
  },
  evidence: {
    collected: [], total: 13, completionPercent: 0,
    connections: [], narrativeLayers: [], board: [],
  },
})

export default useGameStore
