import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import EgkLogo from '../components/EgkLogo'

const roleLabels = { player: 'لاعب', admin: 'أدمن', host: 'هوست' }

export default function HomePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/'); return }
      const snap = await getDoc(doc(db, 'players', user.uid))
      if (snap.exists()) setPlayer(snap.data())
      setLoading(false)
    })
    return () => unsub()
  }, [navigate])

  async function handleLogout() {
    await signOut(auth)
    navigate('/')
  }

  if (loading) {
    return <div style={s.loadingWrap}><p style={{ color: 'var(--egk-text-muted)', fontSize: 13 }}>جاري التحميل...</p></div>
  }

  const canSeeAdmin = player?.role === 'host' || player?.role === 'admin'

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EgkLogo size={28} />
            <span style={s.title}>EGK</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {player && <span style={s.roleBadge}>{roleLabels[player.role] || player.role}</span>}
            <button onClick={handleLogout} style={s.logoutBtn}>خروج</button>
          </div>
        </div>

        <div style={s.welcome}>
          <p style={{ fontSize: 15, color: 'var(--egk-text-primary)', margin: 0 }}>
            أهلاً {player?.name || player?.email || ''} 👋
          </p>
        </div>

        <div style={{ padding: '0 1.1rem 1rem', display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/standings')} style={s.standingsBtn}>الترتيب</button>
          {canSeeAdmin && (
            <button onClick={() => navigate('/admin')} style={s.adminBtn}>لوحة التحكم</button>
          )}
        </div>

        <div style={s.tabsWrap}>
          <div style={s.tabActive}>الدوري</div>
          <div style={s.tabInactive}>دوري الأبطال</div>
          <div style={s.tabInactive}>الكأس</div>
        </div>

        <div style={{ padding: '1rem 1.1rem' }}>
          <p style={s.sectionTitle}>آخر الأخبار</p>
          <div style={s.newsCard}>
            <p style={{ fontSize: 13, color: 'var(--egk-text-primary)', margin: 0 }}>
              أهلاً بيك في منصة EGK — البداية كانت هنا 🎉
            </p>
          </div>
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
  roleBadge: { fontSize: 11, padding: '3px 8px', borderRadius: 'var(--egk-radius-sm)', background: 'rgba(226,75,74,0.15)', color: 'var(--egk-accent)' },
  logoutBtn: { background: 'transparent', border: '1px solid var(--egk-border-strong)', color: 'var(--egk-text-secondary)', fontSize: 12, padding: '5px 10px', borderRadius: 'var(--egk-radius-sm)' },
  welcome: { padding: '1rem 1.1rem 0.5rem' },
  standingsBtn: { flex: 1, padding: '10px 0', background: 'transparent', border: '1px solid var(--egk-accent)', color: 'var(--egk-accent)', borderRadius: 'var(--egk-radius-sm)', fontWeight: 500, fontSize: 13 },
  adminBtn: { flex: 1, padding: '10px 0', background: 'var(--egk-accent)', color: 'var(--egk-accent-on)', border: 'none', borderRadius: 'var(--egk-radius-sm)', fontWeight: 500, fontSize: 13 },
  tabsWrap: { display: 'flex', borderBottom: '0.5px solid var(--egk-border)', marginTop: 4 },
  tabActive: { flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 13, fontWeight: 500, color: 'var(--egk-accent)', borderBottom: '2px solid var(--egk-accent)' },
  tabInactive: { flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 13, color: 'var(--egk-text-muted)' },
  sectionTitle: { fontSize: 11, color: 'var(--egk-text-dim)', margin: '0 0 8px', letterSpacing: 1 },
  newsCard: { background: 'var(--egk-surface-raised)', borderRadius: 8, padding: 12, borderRight: '3px solid var(--egk-accent)' },
}
