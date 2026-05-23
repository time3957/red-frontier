import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import CharacterCreate from './pages/CharacterCreate.jsx'
import GameScreen from './pages/GameScreen.jsx'
import useGameStore from './store/gameStore'
import SettingsModal from './components/Settings/SettingsModal.jsx'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('rf_token')
  if (!token) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const accessibility = useGameStore((state) => state.ui.accessibility)
  const settingsOpen = useGameStore((state) => state.ui.settingsOpen)
  const toggleSettings = useGameStore((state) => state.toggleSettings)

  useEffect(() => {
    if (accessibility) {
      document.documentElement.style.setProperty('--font-scale', accessibility.fontSize)
      document.documentElement.style.setProperty('--brightness-scale', accessibility.brightness)
      document.documentElement.style.setProperty('--contrast-scale', accessibility.contrast)
    }
  }, [accessibility])

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CharacterCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <GameScreen />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {settingsOpen && <SettingsModal onClose={toggleSettings} />}
    </>
  )
}
