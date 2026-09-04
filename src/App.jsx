import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EntryPage from './pages/EntryPage'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import StandingsPage from './pages/StandingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/standings" element={<StandingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
