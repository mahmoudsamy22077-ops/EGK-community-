import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import EgkLogo from '../components/EgkLogo'

export default function StandingsPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/'); return }

      const playersSnap = await getDocs(collection(db, 'players'))
      const playersMap = {}
      playersSnap.forEach((d) => { playersMap[d.id] = d.data() })

      const stats = {}
      Object.keys(playersMap).forEach((id) => {
        stats[id] = { id, name: playersMap[id].name || playersMap[id].email, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, points: 0 }
      })

      const matchesSnap = await getDocs(collection(db, 'matches'))
      matchesSnap.forEach((d) => {
        const m = d.data()
        const home = stats[m.homeId]
        const away = stats[m.awayId]
        if (!home || !away) return

        home.played++; away.played++
        home.gf += m.homeScore; home.ga += m.awayScore
        away.gf += m.awayScore; away.ga += m.homeScore

        if (m.homeScore > m.awayScore) {
          home.won++; home.points += 3
          away.lost++
        } else if (m.homeScore < m.awayScore) {
          away.won++; away.points += 3
          home.lost++
        } else {
          home.draw++; away.draw++
          home.points += 1; away.points += 1
        }
      })

      const list = Object.values(stats).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        return (b.gf - b.ga) - (a.gf - a.ga)
      })

      setRows(list)
      setLoading(false)
    })
    return () => unsub()
  }, [navigate])

  if (loading) {
    return <div style={s.loadingWrap}><p style={{ color: 'var(--egk-text-muted)', fontSize: 13 }}>جاري التحميل...</p></div>
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EgkLogo size={26} />
            <span style={s.title}>ترتيب EGK LEAGUE</span>
          </div>
          <button onClick={() => navigate('/home')} style={s.backBtn}>رجوع</button>
        </div>

        <div style={{ padding: '1rem 1.1rem' }}>
          {rows.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--egk-text-dim)' }}>لسه مفيش نتائج متسجلة.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.thNum}>#</th>
                  <th style={s.th}>اللاعب</th>
                  <th style={s.thCenter}>ل</th>
                  <th style={s.thCenter}>ف</th>
                  <th style={s.thCenter}>ت</th>
                  <th style={s.thCenter}>خ</th>
                  <th style={s.thRight}>نقاط</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} style={s.tr}>
                    <td style={s.tdDim}>{i + 1}</td>
                    <td style={s.td}>{r.name}</td>
                    <td style={s.tdCenter}>{r.played}</td>
                    <td style={s.tdCenter}>{r.won}</td>
                    <td style={s.tdCenter}>{r.draw}</td>
                    <td style={s.tdCenter}>{r.lost}</td>
                    <td style={s.tdPoints}>{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
  title: { fontWeight: 500, fontSize: 14, color: 'var(--egk-text-primary)' },
  backBtn: { background: 'transparent', border: '1px solid var(--egk-border-strong)', color: 'var(--egk-text-secondary)', fontSize: 12, padding: '5px 10px', borderRadius: 'var(--egk-radius-sm)' },
  table: { width: '100%', fontSize: 13, borderCollapse: 'collapse' },
  th: { textAlign: 'right', padding: '4px 0', color: 'var(--egk-text-muted)', fontSize: 11, fontWeight: 400 },
  thNum: { textAlign: 'right', padding: '4px 0', color: 'var(--egk-text-muted)', fontSize: 11, fontWeight: 400, width: 20 },
  thCenter: { textAlign: 'center', padding: '4px 0', color: 'var(--egk-text-muted)', fontSize: 11, fontWeight: 400, width: 26 },
  thRight: { textAlign: 'left', padding: '4px 0', color: 'var(--egk-text-muted)', fontSize: 11, fontWeight: 400, width: 40 },
  tr: { borderTop: '0.5px solid var(--egk-border)' },
  td: { padding: '7px 0', color: 'var(--egk-text-primary)' },
  tdDim: { padding: '7px 0', color: 'var(--egk-text-dim)' },
  tdCenter: { padding: '7px 0', textAlign: 'center', color: 'var(--egk-text-secondary)' },
  tdPoints: { padding: '7px 0', textAlign: 'left', fontWeight: 500, color: 'var(--egk-text-primary)' },
          }
