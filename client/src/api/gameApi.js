import axios from 'axios'

// ─── Axios Instance ─────────────────────────────────────
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── Request Interceptor — attach token ─────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rf_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor — handle 401 ─────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rf_token')
      localStorage.removeItem('rf_user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// ─── Auth Endpoints ─────────────────────────────────────
export const auth = {
  /**
   * Register a new user account
   * @param {{ username: string, password: string, email?: string }} data
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * Login and receive a JWT token
   * @param {{ username: string, password: string }} data
   */
  login: (data) => api.post('/auth/login', data),

  /**
   * Get the currently authenticated user's profile
   */
  getMe: () => api.get('/auth/me'),
}

// ─── Character Endpoints ────────────────────────────────
export const character = {
  /**
   * Create a new character
   * @param {{ name: string, class: string }} data
   */
  create: (data) => api.post('/character/create', data),

  /**
   * Get the player's full character state (stats, inventory, etc.)
   */
  getState: () => api.get('/character/state'),

  /**
   * Rest to restore HP and O2
   */
  rest: () => api.post('/character/rest'),
}

// ─── Game Endpoints ─────────────────────────────────────
export const game = {
  /**
   * Get the full current game state (narrative node, combat, etc.)
   */
  getState: () => api.get('/game/state'),

  /**
   * Perform a narrative action / make a choice
   * @param {{ choiceId: string, nodeId: string }} data
   */
  action: (data) => api.post('/game/action', data),

  /**
   * Initiate combat at a location
   * @param {string} location
   */
  startCombat: (location) => api.post('/game/combat/start', { location }),

  /**
   * Perform a combat action (attack, dodge, flee, use item)
   * @param {{ action: string, targetId?: string, itemId?: string }} data
   */
  combatAction: (data) => api.post('/game/combat/action', data),

  /**
   * Explore a location for resources or story triggers
   * @param {{ location: string, direction?: string }} data
   */
  explore: (data) => api.post('/game/explore', data),
}

// ─── Evidence Endpoints ─────────────────────────────────
export const evidence = {
  /**
   * Get the full evidence board (all clues, collected status)
   */
  getBoard: () => api.get('/evidence/board'),

  /**
   * Mark a clue as collected by the player
   * @param {string} clueId
   */
  collect: (clueId) => api.post(`/evidence/collect/${clueId}`),
}

export default api
