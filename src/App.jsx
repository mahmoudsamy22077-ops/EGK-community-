import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EntryPage from './pages/EntryPage'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import StandingsPage from './pages/StandingsPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardsPage from './pages/LeaderboardsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/standings" element={<StandingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/leaderboards" element={<LeaderboardsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
