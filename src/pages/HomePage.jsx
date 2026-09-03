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
      <div style={loadingWrapStyle}>
        <p style={{ color: 'var(--egk-text-muted)', fontSize: 13 }}>جاري التحميل...</p>
      </div>
    )
  }

  const canSeeAdmin = player?.role === 'host' || player?.role === 'admin'

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{ display:
