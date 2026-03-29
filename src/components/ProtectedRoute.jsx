import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { load } from '../storage'

export default function ProtectedRoute({ children, roles }) {
  const [status, setStatus] = useState('checking')
  const [session, setSession] = useState(null)

  useEffect(() => {
    load('session').then(s => {
      if (!s) { setStatus('denied'); return }
      if (roles && !roles.includes(s.role)) { setStatus('forbidden'); return }
      setSession(s)
      setStatus('ok')
    })
  }, [])

  if (status === 'checking') return (
    <div style={{ minHeight:'100vh', background:'#0D0A06', display:'flex', alignItems:'center', justifyContent:'center', color:'#5A4A3A', fontFamily:"'Syne',sans-serif" }}>
      Vérification…
    </div>
  )
  if (status === 'denied')    return <Navigate to="/admin" replace />
  if (status === 'forbidden') return <Navigate to="/admin/crm" replace />
  return children
}
