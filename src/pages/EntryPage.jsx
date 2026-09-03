import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import EgkLogo from '../components/EgkLogo'

export default function EntryPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState('')

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')
  const [regError, setRegError] = useState('')

  const [successMsg, setSuccessMsg] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setSuccessMsg('')
    if (!loginEmail.trim() || !loginPass) {
      setLoginError('اكتب الإيميل وكلمة السر')
      return
    }
    setLoginError('')
    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPass)
      setSuccessMsg('تم تسجيل الدخول')
      navigate('/home')
    } catch (err) {
      setLoginError('الإيميل أو كلمة السر غير صحيحة')
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setSuccessMsg('')
    if (!regName.trim() || !regEmail.trim() || !regPass) {
      setRegError('كل الحقول مطلوبة')
      return
    }
    setRegError('')
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        regEmail.trim(),
        regPass
      )

      await setDoc(doc(db, 'players', cred.user.uid), {
        name: regName.trim(),
        email: regEmail.trim(),
        role: 'player',
        facebookUrl: '',
        createdAt: serverTimestamp(),
      })

      setSuccessMsg('تم إنشاء الحساب')
      navigate('/home')
    } catch (err) {
      setRegError('خطأ: ' + err.code + ' - ' + err.message)
    }
  }

  return (
    <div style={pageStyle}>
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{ marginBottom: 8 }}>
          <EgkLogo size={64} />
        </div>
        <div style={titleStyle}>EGK</div>
        <div style={subtitleStyle}>THE DARK KNIGHT</div>
      </div>

      <div style={cardStyle}>
        <div style={tabsWrapStyle}>
          <button
            onClick={() => setTab('login')}
            style={tabBtnStyle(tab === 'login')}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => setTab('register')}
            style={tabBtnStyle(tab === 'register')}
          >
            حساب جديد
          </button>
        </div>

        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <Field label="الإيميل">
              <input
                type="email"
                placeholder="name@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="كلمة السر">
              <input
                type="password"
                placeholder="********"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                style={inputStyle}
              />
            </Field>
            {loginError && <ErrorText text={loginError} />}
            <button type="submit" style={primaryButtonStyle}>
              دخول
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <Field label="الاسم">
              <input
                type="text"
                placeholder="اسمك في المنصة ولازم يكون زي اسم الفيسبوك بظبط"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                style={{ ...inputStyle, fontSize: 12 }}
              />
            </Field>
            <Field label="الإيميل">
              <input
                type="email"
                placeholder="name@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="كلمة السر">
              <input
                type="password"
                placeholder="********"
                value={regPass}
                onChange={(e) => setRegPass(e.target.value)}
                style={inputStyle}
              />
            </Field>
            {regError && <ErrorText text={regError} />}
            <button type="submit" style={primaryButtonStyle}>
              إنشاء الحساب
            </button>
          </form>
        )}

        {successMsg && <p style={successStyle}>{successMsg}</p>}
      </div>

      <p style={footerStyle}>EGK Community</p>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function ErrorText({ text }) {
  return <p style={errorStyle}>{text}</p>
}

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1.25rem',
}

const titleStyle = {
  fontSize: 19,
  fontWeight: 500,
  color: 'var(--egk-text-primary)',
  letterSpacing: 1,
}

const subtitleStyle = {
  fontSize: 10,
  color: 'var(--egk-text-dim)',
  letterSpacing: 3,
  marginTop: 2,
}

const cardStyle = {
  width: '100%',
  maxWidth: 360,
  background: 'var(--egk-surface)',
  borderRadius: 'var(--egk-radius-lg)',
  border: '0.5px solid var(--egk-border)',
  padding: '1.25rem 1.1rem',
}

const tabsWrapStyle = {
  display: 'flex',
  borderRadius: 'var(--egk-radius-md)',
  background: 'var(--egk-surface-raised)',
  padding: 3,
  marginBottom: '1.1rem',
}

function tabBtnStyle(active) {
  return {
    flex: 1,
    padding: '8px 0',
    fontSize: 13,
    border: 'none',
    borderRadius: 'var(--egk-radius-sm)',
    background: active ? 'var(--egk-accent)' : 'transparent',
    color: active ? 'var(--egk-accent-on)' : 'var(--egk-text-muted)',
    fontWeight: active ? 500 : 400,
  }
}

const labelStyle = {
  fontSize: 12,
  color: 'var(--egk-text-muted)',
  display: 'block',
  marginBottom: 4,
}

const errorStyle = {
  fontSize: 12,
  color: 'var(--egk-accent)',
  margin: '0 0 8px',
}

const successStyle = {
  textAlign: 'center',
  fontSize: 13,
  color: 'var(--egk-success)',
  margin: '12px 0 0',
}

const footerStyle = {
  textAlign: 'center',
  fontSize: 11,
  color: 'var(--egk-border-strong)',
  marginTop: '1.5rem',
}

const inputStyle = {
  width: '100%',
  padding: '9px 10px',
  background: 'var(--egk-surface-raised)',
  border: '1px solid var(--egk-border)',
  borderRadius: 'var(--egk-radius-sm)',
  color: 'var(--egk-text-primary)',
}

const primaryButtonStyle = {
  width: '100%',
  padding: '10px 0',
  background: 'var(--egk-accent)',
  color: 'var(--egk-accent-on)',
  border: 'none',
  borderRadius: 'var(--egk-radius-sm)',
  fontWeight: 500,
  marginTop: 6,
        }
