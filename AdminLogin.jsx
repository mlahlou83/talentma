import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { load, save } from '../storage'
import { DEFAULT_ADMIN_USERS } from '../data'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) { setError('Remplis tous les champs.'); return }
    setLoading(true)
    const users = await load('admin-users') || DEFAULT_ADMIN_USERS
    const found = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password)
    if (found) {
      await save('session', { username: found.username, role: found.role, loginAt: new Date().toISOString() })
      navigate('/admin/crm')
    } else {
      setError('Identifiants incorrects.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0D0A06', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Syne',sans-serif" }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ fontSize:44, marginBottom:12 }}>🇲🇦</div>
          <div style={{ fontSize:24, fontWeight:800, color:'#F0EDE8' }}>TalentMA</div>
          <div style={{ fontSize:11, color:'#5A4A3A', fontFamily:"'JetBrains Mono'", letterSpacing:'2px', marginTop:4 }}>ESPACE ADMINISTRATION</div>
        </div>
        <div style={{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:16, padding:28 }}>
          <div style={{ height:3, background:'#C8553D', borderRadius:3, marginBottom:24 }} />
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:'#5A4A3A', marginBottom:6, fontWeight:700 }}>UTILISATEUR</div>
            <input style={{ background:'#110D06', border:'1px solid #2A1E12', borderRadius:8, padding:'10px 14px', color:'#F0EDE8', fontFamily:"'Syne'", fontSize:13, outline:'none', width:'100%' }}
              placeholder="Votre identifiant" value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              onKeyDown={e => e.key==='Enter' && handleLogin()} autoFocus />
          </div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, color:'#5A4A3A', marginBottom:6, fontWeight:700 }}>MOT DE PASSE</div>
            <input type="password" style={{ background:'#110D06', border:'1px solid #2A1E12', borderRadius:8, padding:'10px 14px', color:'#F0EDE8', fontFamily:"'Syne'", fontSize:13, outline:'none', width:'100%' }}
              placeholder="••••••••" value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => e.key==='Enter' && handleLogin()} />
          </div>
          {error && <div style={{ background:'#2D0D0D', border:'1px solid #7A1E17', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#E74C3C', marginBottom:14 }}>⚠️ {error}</div>}
          <button style={{ width:'100%', padding:13, background:'#C8553D', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:700, fontFamily:"'Syne'", cursor:'pointer' }}
            onClick={handleLogin} disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter →'}
          </button>
        </div>
        <div style={{ textAlign:'center', marginTop:16 }}>
          <Link to="/" style={{ fontSize:12, color:'#3A2A18', textDecoration:'none' }}>← Retour au portail client</Link>
        </div>
        <div style={{ textAlign:'center', marginTop:8 }}>
          <Link to="/freelance" style={{ fontSize:12, color:'#3A2A18', textDecoration:'none' }}>Je suis un talent → Inscrivez-moi</Link>
        </div>
      </div>
    </div>
  )
}
