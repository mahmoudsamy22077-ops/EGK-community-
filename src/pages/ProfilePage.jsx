import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import EgkLogo from '../components/EgkLogo'

const roleLabels = { player: 'لاعب', admin: 'أدمن', host: 'هوست' }

export default function ProfilePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [uid, setUid] = useState('')
  const [player, setPlayer] = useState(null)
  const [stats, setStats] = useState({ played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0 })
  const [history, setHistory] = useState([])

  const [fbUrl, setFbUrl] = useState('')
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/'); return }
      setUid(user.uid)

      const snap = await getDoc(doc(db, 'players', user.uid))
      const data = snap.exists() ? snap.data() : null
      setPlayer(data)
      setFbUrl(data?.facebookUrl || '')

      const playersSnap = await getDocs(collection(db, 'players'))
      const playersMap = {}
      playersSnap.forEach((d) => { playersMap[d.id] = d.data() })

      const matchesSnap = await getDocs(collection(db, 'matches'))
      let st = { played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0 }
      const hist = []

      matchesSnap.forEach((d) => {
        const m = d.data()
        if (m.homeId !== user.uid && m.awayId !== user.uid) return

        const isHome = m.homeId === user.uid
        const myScore = isHome ? m.homeScore : m.awayScore
        const oppScore = isHome ? m.awayScore : m.homeScore
        const oppId = isHome ? m.awayId : m.homeId
        const oppName = playersMap[oppId]?.name || playersMap[oppId]?.email || 'لاعب'

        st.played++
        st.gf += myScore
        st.ga += oppScore
        let result = 'تعادل'
        if (myScore > oppScore) { st.won++; result = 'فوز' }
        else if (myScore < oppScore) { st.lost++; result = 'خسارة' }
        else { st.draw++ }

        hist.push({ id: d.id, oppName, myScore, oppScore, result })
      })

      setStats(st)
      setHistory(hist)
      setLoading(false)
    })
    return () => unsub()
  }, [navigate])

  async function handleSaveFb(e) {
    e.preventDefault()
    setSaveMsg('')
    try {
      await updateDoc(doc(db, 'players', uid), { facebookUrl: fbUrl.trim() })
      setSaveMsg('اتحفظ ✅')
    } catch (err) {
      setSaveMsg('خطأ: ' + err.message)
    }
  }

  if (loading) {
    return <div style={s.loadingWrap}><p style={{ color: 'var(--egk-text-muted)', fontSize: 13 }}>جاري التحميل...</p></div>
  }

  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EgkLogo size={26} />
            <span style={s.title}>البروفايل</span>
          </div>
          <button onClick={() => navigate('/home')} style={s.backBtn}>رجوع</button>
        </div>

        <div style={s.section}>
          <p style={s.name}>{player?.name || player?.email}</p>
          {player?.role && <span style={s.roleBadge}>{roleLabels[player.role] || player.role}</span>}
        </div>

        <div style={s.section}>
          <p style={s.sectionTitle}>الإحصائيات</p>
          <div style={s.statsGrid}>
            <StatBox label="مباريات" value={stats.played} />
            <StatBox label="فوز" value={stats.won} />
            <StatBox label="تعادل" value={stats.draw} />
            <StatBox label="خسارة" value={stats.lost} />
            <StatBox label="نسبة الفوز" value={winRate + '%'} />
            <StatBox label="فارق الأهداف" value={(stats.gf - stats.ga >= 0 ? '+' : '') + (stats.gf - stats.ga)} />
          </div>
        </div>

        <div style={s.section}>
          <p style={s.sectionTitle}>رابط الفيسبوك</p>
          <form onSubmit={handleSaveFb} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="https://facebook.com/..."
              value={fbUrl}
              onChange={(e) => setFbUrl(e.target.value)}
              style={{ ...s.input, flex: 1 }}
            />
            <button type="submit" style={s.saveBtn}>حفظ</button>
          </form>
          {saveMsg && <p style={s.msg}>{saveMsg}</p>}
        </div>

        <div style={s.section}>
          <p style={s.sectionTitle}>سجل المباريات</p>
          {history.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--egk-text-dim)' }}>لسه معندكش مباريات مسجلة.</p>
          ) : (
            history.map((h) => (
              <div key={h.id} style={s.historyRow}>
                <span style={s.historyOpp}>ضد {h.oppName}</span>
                <span style={s.historyScore}>{h.myScore} - {h.oppScore}</span>
                <span style={resultStyle(h.result)}>{h.result}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div style={s.statBox}>
      <p style={s.statValue}>{value}</p>
      <p style={s.statLabel}>{label}</p>
    </div>
  )
}

function resultStyle(result) {
  let color = 'var(--egk-text-muted)'
  if (result === 'فوز') color = 'var(--egk-success)'
  if (result === 'خسارة') color = 'var(--egk-accent)'
  return { fontSize: 11, color, minWidth: 46, textAlign: 'left' }
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
  name: { fontSize: 16, fontWeight: 500, color: 'var(--egk-text-primary)', margin: '0 0 6px' },
  roleBadge: { fontSize: 11, padding: '3px 8px', borderRadius: 'var(--egk-radius-sm)', background: 'rgba(226,75,74,0.15)', color: 'var(--egk-accent)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 },
  statBox: { background: 'var(--egk-surface-raised)', borderRadius: 8, padding: '10px 8px', textAlign: 'center' },
  statValue: { fontSize: 16, fontWeight: 500, color: 'var(--egk-text-primary)', margin: '0 0 2px' },
  statLabel: { fontSize: 10, color: 'var(--egk-text-dim)', margin: 0 },
  input: { padding: '9px 10px', background: 'var(--egk-surface-raised)', border: '1px solid var(--egk-border)', borderRadius: 'var(--egk-radius-sm)', color: 'var(--egk-text-primary)' },
  saveBtn: { padding: '9px 16px', background: 'var(--egk-accent)', color: 'var(--egk-accent-on)', border: 'none', borderRadius: 'var(--egk-radius-sm)', fontWeight: 500, fontSize: 13 },
  msg: { fontSize: 12, color: 'var(--egk-accent)', margin: '8px 0 0' },
  historyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderTop: '0.5px solid var(--egk-border)', fontSize: 12 },
  historyOpp: { color: 'var(--egk-text-secondary)', flex: 1 },
  historyScore: { color: 'var(--egk-text-primary)', fontWeight: 500, minWidth: 50, textAlign: 'center' },
}
