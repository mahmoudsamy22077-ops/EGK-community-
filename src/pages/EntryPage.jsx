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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{ marginBottom: 8 }}>
          <EgkLogo size={64} />
        </div>
        <div
          style={{
            fontSize: 19,
            fontWeight: 500,
            color: 'var(--egk-text-primary)',
            letterSpacing: 1,
          }}
        >
          EGK
        </div>
        <div
          style={{
            fontSize: 10,
            color: 'var(--egk-text-d
