import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import EgkLogo from '../components/EgkLogo'

const roleLabels = {
  player: 'لاعب',
  admin: 'أدمن',
  host: 'هوست',
}

export default function HomePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/')
        return
      }
      const snap = await getDoc(doc(db, 'players', user.uid))
      if (snap.exists()) {
        setPlayer(snap.data())
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [navigate])

  async function handleLogout() {
    await signOut(auth)
    navigate('/')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--egk-text-muted)', fontSize: 13 }}>جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '1rem' }}>
      <div
        style={{
          background: 'var(--egk-surface)',
          borderRadius: 'var(--egk-radius-lg)',
          border: '0.5px solid var(--egk-border)',
          overflow: 'hidden',
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        {/* الهيدر */}
        <div
          style={{
            padding: '0.9rem 1.1rem',
            borderBottom: '1px solid var(--egk-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EgkLogo size={28} />
            <span style={{ fontWeight: 500, fontSize: 15, color: 'var(--egk-text-primary)' }}>
              EGK
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {player && (
              <span
                style={{
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 'var(--egk-radius-sm)',
                  background: 'rgba(226,75,74,0.15)',
                  color: 'var(--egk-accent)',
                }}
              >
                {roleLabels[player.role] || player.role}
              </span>
            )}
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid var(--egk-border-strong)',
                color: 'var(--egk-text-secondary)',
                fontSize: 12,
                padding: '5px 10px',
                borderRadius: 'var(--egk-radius-sm)',
              }}
            >
              خروج
            </button>
          </div>
        </div>

        {/* ترحيب */}
        <div style={{ padding: '1rem 1.1rem 0.5rem' }}>
          <p style={{ fontSize: 15, color: 'var(--egk-text-primary)', margin: 0 }}>
            أهلاً {player?.name || ''} 👋
          </p>
        </div>

        {/* التابات */}
        <div style={{ display: 'flex', borderBottom: '0.5px solid var(--egk-border)', marginTop: 12 }}>
          <TabItem label="الدوري" active />
          <TabItem label="دوري الأبطال" />
          <TabItem label="الكأس" />
        </div>

        {/* أخبار */}
        <Section title="آخر الأخبار">
          <div
            style={{
              background: 'var(--egk-surface-raised)',
              borderRadius: 8,
              padding: 12,
              borderRight: '3px solid var(--egk-accent)',
            }}
          >
            <p style={{ fontSize: 13, color: 'var(--egk-text-primary)', margin: 0 }}>
              أهلاً بيك في منصة EGK — البداية كانت هنا 🎉
            </p>
          </div>
        </Section>

        {/* Overall Ranking (تجريبي لحد ما نبني نظام النقاط) */}
        <Section title="Overall Ranking">
          <p style={{ fontSize: 12, color: 'var(--egk-text-dim)', margin: 0 }}>
            هيظهر هنا أول ما يبدأ أول موسم ويتسجل نتائج
          </p>
        </Section>
      </div>
    </div>
  )
}

function TabItem({ label, active }) {
  return (
    <div
      style={{
        flex: 1,
        textAlign: 'center',
        padding: '10px 0',
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        color: active ? 'var(--egk-accent)' : 'var(--egk-text-muted)',
        borderBottom: active ? '2px solid var(--egk-accent)' : 'none',
      }}
    >
      {label}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ padding: '1rem 1.1rem' }}>
      <p style={{ fontSize: 11, color: 'var(--egk-text-dim)', margin: '0 0 8px', letterSpacing: 1 }}>
        {title}
      </p>
      {children}
    </div>
  )
    }
