import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import EgkLogo from '../components/EgkLogo'

export default function AdminPage() {
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
      const data = snap.exists() ? snap.data() : null

      // حماية: لو مش هوست (أو أدمن بعدين) امنعه وارجعه للرئيسية
      if (!data || data.role !== 'host') {
        navigate('/home')
        return
      }

      setPlayer(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [navigate])

  if (loading) {
    return (
      <div style={loadingWrapStyle}>
        <p style={{ color: 'var(--egk-text-muted)', fontSize: 13 }}>جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EgkLogo size={26} />
            <span style={titleStyle}>لوحة التحكم</span>
          </div>
          <button onClick={() => navigate('/home')} style={backBtnStyle}>
            رجوع للرئيسية
          </button>
        </div>

        <Section title="إدخال نتيجة مباراة">
          <p style={placeholderTextStyle}>
            هنا هنضيف فورم إدخال النتائج لما نبني نظام المباريات والجولات.
          </p>
        </Section>

        <Section title="إدارة الصلاحيات">
          <p style={placeholderTextStyle}>
            هنا الهوست هيقدر يرقّي أي لاعب لأدمن، ويحدد مستوى صلاحيته.
          </p>
        </Section>

        <Section title="العقوبات">
          <p style={placeholderTextStyle}>
            خصم نقط أو إقصاء لأي لاعب، بناءً على تقدير الهوست.
          </p>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={sectionStyle}>
      <p style={sectionTitleStyle}>{title}</p>
      {children}
    </div>
  )
}

const loadingWrapStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const pageStyle = {
  minHeight: '100vh',
  padding: '1rem',
}

const cardStyle = {
  background: 'var(--egk-surface)',
  borderRadius: 'var(--egk-radius-lg)',
  border: '0.5px solid var(--egk-border)',
  overflow: 'hidden',
  maxWidth: 480,
  margin: '0 auto',
}

const headerStyle = {
  padding: '0.9rem 1.1rem',
  borderBottom: '1px solid var(--egk-accent)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const titleStyle = {
  fontWeight: 500,
  fontSize: 15,
  color: 'var(--egk-text-primary)',
}

const backBtnStyle = {
  background: 'transparent',
  border: '1px solid var(--egk-border-strong)',
  color: 'var(--egk-text-secondary)',
  fontSize: 12,
  padding: '5px 10px',
  borderRadius: 'var(--egk-radius-sm)',
}

const sectionStyle = {
  padding: '1rem 1.1rem',
  borderBottom: '0.5px solid var(--egk-border)',
}

const sectionTitleStyle = {
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--egk-text-primary)',
  margin: '0 0 6px',
}

const placeholderTextStyle = {
  fontSize: 12,
  color: 'var(--egk-text-dim)',
  margin: 0,
    }
