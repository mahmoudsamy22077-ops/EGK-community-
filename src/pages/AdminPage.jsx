import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import EgkLogo from '../components/EgkLogo'

export default function AdminPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [currentUid, setCurrentUid] = useState('')
  const [players, setPlayers] = useState([])

  const [homeId, setHomeId] = useState('')
  const [awayId, setAwayId] = useState('')
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [saveMsg, setSaveMsg] = useState('')

  const [roleMsg, setRoleMsg] = useState('')

  const [penPlayerId, setPenPlayerId] = useState('')
  const [penPoints, setPenPoints] = useState('')
  const [penReason, setPenReason] = useState('')
  const [penMsg, setPenMsg] = useState('')
  const [recentPenalties, setRecentPenalties] = useState([])

  async function loadPlayers() {
    const playersSnap = await getDocs(collection(db, 'players'))
    const list = []
    playersSnap.forEach((d) => list.push({ id: d.id, ...d.data() }))
    setPlayers(list)
    return list
  }

  async function loadPenalties(list) {
    const q = query(collection(db, 'penalties'), orderBy('appliedAt', 'desc'), limit(5))
    const snap = await getDocs(q)
    const nameOf = (id) => {
      const p = list.find((pl) => pl.id === id)
      return p ? (p.name || p.email) : id
    }
    const items = []
    snap.forEach((d) => {
      const data = d.data()
      items.push({ id: d.id, playerName: nameOf(data.playerId), points: data.points, reason: data.reason })
    })
    setRecentPenalties(items)
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/'); return }
      const snap = await getDoc(doc(db, 'players', user.uid))
      const data = snap.exists() ? snap.data() : null
      if (!data || data.role !== 'host') { navigate('/home'); return }

      setCurrentUid(user.uid)
      const list = await loadPlayers()
      await loadPenalties(list)
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
        homeId, awayId,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        createdAt: serverTimestamp(),
      })
      setSaveMsg('اتحفظت النتيجة ✅')
      setHomeId(''); setAwayId(''); setHomeScore(''); setAwayScore('')
    } catch (err) {
      setSaveMsg('خطأ: ' + err.message)
    }
  }

  async function handleRoleChange(playerId, newRole) {
    setRoleMsg('')
    try {
      await updateDoc(doc(db, 'players', playerId), { role: newRole })
      await loadPlayers()
      setRoleMsg('اتحدثت الصلاحية ✅')
    } catch (err) {
      setRoleMsg('خطأ: ' + err.message)
    }
  }

  async function handleAddPenalty(e) {
    e.preventDefault()
    setPenMsg('')
    if (!penPlayerId || penPoints === '' || !penReason.trim()) {
      setPenMsg('اختار اللاعب واكتب النقط والسبب')
      return
    }
    try {
      await addDoc(collection(db, 'penalties'), {
        playerId: penPlayerId,
        points: Number(penPoints),
        reason: penReason.trim(),
        appliedAt: serverTimestamp(),
      })
      setPenMsg('اتسجلت العقوبة ✅')
      setPenPlayerId(''); setPenPoints(''); setPenReason('')
      await loadPenalties(players)
    } catch (err) {
      setPenMsg('خطأ: ' + err.message)
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
              {players.map((p) => <option key={p.id} value={p.id}>{p.name || p.email}</option>)}
            </select>
            <label style={s.label}>اللاعب الثاني</label>
            <select value={awayId} onChange={(e) => setAwayId(e.target.value)} style={s.select}>
              <option value="">اختار لاعب</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.name || p.email}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <input type="number" placeholder="نتيجة الأول" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} style={{ ...s.input, flex: 1 }} />
              <input type="number" placeholder="نتيجة الثاني" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} style={{ ...s.input, flex: 1 }} />
            </div>
            {saveMsg && <p style={s.msg}>{saveMsg}</p>}
            <button type="submit" style={s.saveBtn}>حفظ النتيجة</button>
          </form>
        </div>

        <div style={s.section}>
          <p style={s.sectionTitle}>إدارة الصلاحيات</p>
          {roleMsg && <p style={s.msg}>{roleMsg}</p>}
          {players.filter((p) => p.id !== currentUid).map((p) => (
            <div key={p.id} style={s.playerRow}>
              <span style={s.playerName}>{p.name || p.email}</span>
              <select value={p.role} onChange={(e) => handleRoleChange(p.id, e.target.value)} style={s.roleSelect}>
                <option value="player">لاعب</option>
                <option value="admin">أدمن</option>
              </select>
            </div>
          ))}
        </div>

        <div style={s.section}>
          <p style={s.sectionTitle}>العقوبات</p>
          <form onSubmit={handleAddPenalty}>
            <label style={s.label}>اللاعب</label>
            <select value={penPlayerId} onChange={(e) => setPenPlayerId(e.target.value)} style={s.select}>
              <option value="">اختار لاعب</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.name || p.email}</option>)}
            </select>
            <label style={s.label}>عدد النقط المخصومة</label>
            <input type="number" placeholder="مثلاً 3" value={penPoints} onChange={(e) => setPenPoints(e.target.value)} style={s.input} />
            <label style={s.label}>السبب</label>
            <input type="text" placeholder="مثلاً: عدم حضور المباراة" value={penReason} onChange={(e) => setPenReason(e.target.value)} style={s.input} />
            {penMsg && <p style={s.msg}>{penMsg}</p>}
            <button type="submit" style={s.saveBtn}>تسجيل العقوبة</button>
          </form>

          {recentPenalties.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <p style={s.subLabel}>آخر العقوبات</p>
              {recentPenalties.map((pen) => (
                <div key={pen.id} style={s.penRow}>
                  <span style={s.playerName}>{pen.playerName}</span>
                  <span style={s.penDetail}>-{pen.points} نقطة — {pen.reason}</span>
                </div>
              ))}
            </div>
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
  title: { fontWeight: 500, fontSize: 15, color: 'var(--egk-text-primary)' },
  backBtn: { background: 'transparent', border: '1px solid var(--egk-border-strong)', color: 'var(--egk-text-secondary)', fontSize: 12, padding: '5px 10px', borderRadius: 'var(--egk-radius-sm)' },
  section: { padding: '1rem 1.1rem', borderBottom: '0.5px solid var(--egk-border)' },
  sectionTitle: { fontSize: 13, fontWeight: 500, color: 'var(--egk-text-primary)', margin: '0 0 10px' },
  subLabel: { fontSize: 11, color: 'var(--egk-text-dim)', margin: '0 0 6px', letterSpacing: 1 },
  label: { fontSize: 12, color: 'var(--egk-text-muted)', display: 'block', marginTop: 8, marginBottom: 4 },
  select: { width: '100%', padding: '9px 10px', background: 'var(--egk-surface-raised)', border: '1px solid var(--egk-border)', borderRadius: 'var(--egk-radius-sm)', color: 'var(--egk-text-primary)' },
  input: { padding: '9px 10px', background: 'var(--egk-surface-raised)', border: '1px solid var(--egk-border)', borderRadius: 'var(--egk-radius-sm)', color: 'var(--egk-text-primary)', width: '100%', boxSizing: 'border-box', marginTop: 4 },
  msg: { fontSize: 12, color: 'var(--egk-accent)', margin: '10px 0' },
  saveBtn: { width: '100%', padding: '10px 0', background: 'var(--egk-accent)', color: 'var(--egk-accent-on)', border: 'none', borderRadius: 'var(--egk-radius-sm)', fontWeight: 500, marginTop: 12 },
  playerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '0.5px solid var(--egk-border)' },
  playerName: { fontSize: 13, color: 'var(--egk-text-secondary)' },
  roleSelect: { padding: '5px 8px', background: 'var(--egk-surface-raised)', border: '1px solid var(--egk-border)', borderRadius: 'var(--egk-radius-sm)', color: 'var(--egk-text-primary)', fontSize: 12 },
  penRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '0.5px solid var(--egk-border)' },
  penDetail: { fontSize: 12, color: 'var(--egk-text-dim)' },
                }
