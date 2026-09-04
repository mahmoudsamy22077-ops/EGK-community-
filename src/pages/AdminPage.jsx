import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, doc, getDoc, getDocs, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import EgkLogo from '../components/EgkLogo'

export default function AdminPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState([])

  const [homeId, setHomeId] = useState('')
  const [awayId, setAwayId] = useState('')
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/'); return }
      const snap = await getDoc(doc(db, 'players', user.uid))
      const data = snap.exists() ? snap.data() : null
      if (!data || data.role !== 'host') { navigate('/home'); return }

      const playersSnap = await getDocs(collection(db, 'players'))
      const list = []
      playersSnap.forEach((d) => list.push({ id: d.id, ...d.data() }))
      setPlayers(list)
      setLoading(false)
    })
    return () => unsub()
  }, [navigate])

  async function handleSaveMatch(e) {
    e.preventDefault()
    setSaveMsg('')
    if (!homeId || !awayId || homeScore === '' || awayScore === '') {
      setSaveMsg('اختار اللاعبين واكتب النتيجة كاملة')
      return
    }
    if (homeId === awayId) {
      setSaveMsg('لازم تختار لاعبين مختلفين')
      return
    }
    try {
      await addDoc(collection(db, 'matches'), {
        homeId,
        awayId,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        createdAt: serverTimestamp(),
      })
      setSaveMsg('اتحفظت النتيجة ✅')
      setHomeId('')
      setAwayId('')
      setHomeScore('')
      setAwayScore('')
    } catch (err) {
      setSaveMsg('خطأ: ' + err.message)
    }
  }

  if (loading) {
    return <div style={s.loadingWrap}><p style={{ color: 'var(--egk-text-muted)', fontSize: 13 }}>جاري التحميل...</p></div>
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EgkLogo size={26} />
            <span style={s.title}>لوحة التحكم</span>
          </div>
          <button onClick={() => navigate('/home')} style={s.backBtn}>رجوع للرئيسية</button>
        </div>

        <div style={s.section}>
          <p style={s.sectionTitle}>إدخال نتيجة مباراة</p>
          <form onSubmit={handleSaveMatch}>
            <label style={s.label}>اللاعب الأول</label>
            <select value={homeId} onChange={(e) => setHomeId(e.target.value)} style={s.select}>
              <option value="">اختار لاعب</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name || p.email}</option>
              ))}
            </select>

            <label style={s.label}>اللاعب الثاني</label>
            <select value={awayId} onChange={(e) => setAwayId(e.target.value)} style={s.select}>
              <option value="">اختار لاعب</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name || p.email}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <input
                type="number"
                placeholder="نتيجة الأول"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                style={{ ...s.input, flex: 1 }}
              />
              <input
                type="number"
                placeholder="نتيجة الثاني"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                style={{ ...s.input, flex: 1 }}
              />
            </div>

            {saveMsg && <p style={s.msg}>{saveMsg}</p>}

            <button type="submit" style={s.saveBtn}>حفظ النتيجة</button>
          </form>
        </div>

        <div style={s.section}>
          <p style={s.sectionTitle}>إدارة الصلاحيات</p>
          <p style={s.placeholder}>هنا الهوست هيقدر يرقّي أي لاعب لأدمن، ويحدد مستوى صلاحيته.</p>
        </div>

        <div style={s.section}>
          <p style={s.sectionTitle}>العقوبات</p>
          <p style={s.placeholder}>خصم نقط أو إقصاء لأي لاعب، بناءً على تقدير الهوست.</p>
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
  placeholder: { fontSize: 12, color: 'var(--egk-text-dim)', margin: 0 },
  label: { fontSize: 12, color: 'var(--egk-text-muted)', display: 'block', marginTop: 8, marginBottom: 4 },
  select: { width: '100%', padding: '9px 10px', background: 'var(--egk-surface-raised)', border: '1px solid var(--egk-border)', borderRadius: 'var(--egk-radius-sm)', color: 'var(--egk-text-primary)' },
  input: { padding: '9px 10px', background: 'var(--egk-surface-raised)', border: '1px solid var(--egk-border)', borderRadius: 'var(--egk-radius-sm)', color: 'var(--egk-text-primary)', width: '100%', boxSizing: 'border-box' },
  msg: { fontSize: 12, color: 'var(--egk-accent)', margin: '10px 0 0' },
  saveBtn: { width: '100%', padding: '10px 0', background: 'var(--egk-accent)', color: 'var(--egk-accent-on)', border: 'none', borderRadius: 'var(--egk-radius-sm)', fontWeight: 500, marginTop: 12 },
      }
