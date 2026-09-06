import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import EgkLogo from '../components/EgkLogo'

export default function LeaderboardsPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [topScorers, setTopScorers] = useState([])
  const [topWinners, setTopWinners] = useState([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/'); return }
      const playersSnap = await getDocs(collection(db, 'players'))
      const stats = {}
      playersSnap.forEach((d) => {
        const data = d.data()
        stats[d.id] = { id: d.id, name: data.name || data.email, goals: 0, wins: 0, played: 0 }
      })
      const matchesSnap = await getDocs(collection(db, 'matches'))
      matchesSnap.forEach((d) => {
        const m = d.data()
        const home = stats[m.homeId]
        const away = stats[m.awayId]
        if (!home || !away) return
        home.played++; away.played++
        home.goals += m.homeScore; away.goals += m.awayScore
        if (m.homeScore > m.awayScore) home.wins++
        else if (m.awayScore > m.homeScore) away.wins++
      })
      const list = Object.values(stats).filter((p) => p.played > 0)
      setTopScorers([...list].sort((a, b) => b.goals - a.goals).slice(0, 10))
      setTopWinners([...list].sort((a, b) => b.wins - a.wins).slice(0, 10))
      setLoading(false)
    })
    return () => unsub()
  }, [navigate])

  if (loading) return <div style={s.loadingWrap}><p style={{ color: 'var(--egk-text-muted)', fontSize: 13 }}>جاري التحميل...</p></div>

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EgkLogo size={26} />
            <span style={s.title}>Leaderboards</span>
          </div>
          <button onClick={() => navigate('/home')} style={s.backBtn}>رجوع</button>
        </div>
        <div style={s.section}>
          <p style={s.sectionTitle}>الهدافين (كل البطولات)</p>
          {topScorers.length === 0 ? <p style={s.empty}>لسه مفيش نتائج.</p> : topScorers.map((p, i) => (
            <div key={p.id} style={s.row}>
              <span style={s.rank}>{i + 1}</span><span style={s.name}>{p.name}</span><span style={s.value}>{p.goals} هدف</span>
            </div>
          ))}
        </div>
        <div style={s.section}>
          <p style={s.sectionTitle}>الأكتر فوزًا</p>
          {topWinners.length === 0 ? <p style={s.empty}>لسه مفيش نتائج.</p> : topWinners.map((p, i) => (
            <div key={p.id} style={s.row}>
              <span style={s.rank}>{i + 1}</span><span style={s.name}>{p.name}</span><span style={s.value}>{p.wins} فوز</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const s = {
  loadingWrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  page: { minHeight: '100vh', padding: '1rem' },
  card: { background: 'var(--egk-surface)', borderRadius: 'var(--egk-radius-lg)', border: '0.5px solid var(--egk-border)', overflow: 'hidden', maxWidth: 480, margin: '0 auto' },
  header: { padding: '0.9rem 1.1rem', borderBottom: '1px solid var(--egk-accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontWeight: 500, fontSize: 15, color: 'var(--egk-text-primary)' },
  backBtn: { background: 'transparent', border: '1px solid var(--egk-border-strong)', color: 'var(--egk-text-secondary)', fontSize: 12, padding: '5px 10px', borderRadius: 'var(--egk-radius-sm)' },
  section: { padding: '1rem 1.1rem', borderBottom: '0.5px solid var(--egk-border)' },
  sectionTitle: { fontSize: 13, fontWeight: 500, color: 'var(--egk-text-primary)', margin: '0 0 10px' },
  empty: { fontSize: 12, color: 'var(--egk-text-dim)' },
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '0.5px solid var(--egk-border)' },
  rank: { fontSize: 12, color: 'var(--egk-text-dim)', width: 16 },
  name: { fontSize: 13, color: 'var(--egk-text-secondary)', flex: 1 },
  value: { fontSize: 13, color: 'var(--egk-accent)', fontWeight: 500 },
}
