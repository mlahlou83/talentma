import { useNavigate, useLocation } from 'react-router-dom'
import { save } from '../storage'

const NAV_ITEMS = [
  { path:'/admin/crm',        label:'CRM',          icon:'☰',  roles:['superadmin','admin','collaborateur'] },
  { path:'/admin/dashboard',  label:'Dashboard',    icon:'📊', roles:['superadmin','admin'] },
  { path:'/admin/demandes',   label:'Demandes',     icon:'📥', roles:['superadmin','admin','collaborateur'] },
  { path:'/admin/immigration',label:'Immigration',  icon:'✈️', roles:['superadmin','admin'] },
  { path:'/admin/onboarding', label:'Onboarding',   icon:'🆕', roles:['superadmin','admin'] },
  { path:'/admin/superadmin', label:'Super Admin',  icon:'⚙️', roles:['superadmin'] },
]

export default function AdminNav({ session }) {
  const navigate = useNavigate()
  const location = useLocation()

  const logout = async () => {
    await save('session', null)
    navigate('/admin')
  }

  const visible = NAV_ITEMS.filter(item => item.roles.includes(session?.role))

  return (
    <div style={{ background:'#110D06', borderBottom:'1px solid #2A1E12', padding:'0 16px', position:'sticky', top:0, zIndex:50 }}>
      <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', height:52, gap:6, overflowX:'auto' }}>
        <div style={{ marginRight:12, flexShrink:0 }}>
          <div style={{ fontSize:13, fontWeight:800 }}>🇲🇦 TalentMA</div>
          <div style={{ fontSize:9, color:'#5A4A3A', fontFamily:"'JetBrains Mono'", letterSpacing:'1px' }}>{session?.username}</div>
        </div>
        {visible.map(item => (
          <button key={item.path}
            onClick={() => navigate(item.path)}
            style={{ padding:'6px 12px', borderRadius:8, border:`1px solid ${location.pathname===item.path?'#C8553D':'#2A1E12'}`, background:location.pathname===item.path?'#C8553D':'transparent', color:location.pathname===item.path?'#fff':'#7A6A5A', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:"'Syne'", whiteSpace:'nowrap', flexShrink:0, transition:'all .15s' }}>
            {item.icon} {item.label}
          </button>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', gap:6, flexShrink:0 }}>
          <button onClick={() => navigate('/')}
            style={{ padding:'6px 12px', borderRadius:8, border:'1px solid #0F6E5640', background:'transparent', color:'#0F6E56', cursor:'pointer', fontSize:11, fontWeight:600, fontFamily:"'Syne'" }}>
            Portail →
          </button>
          <button onClick={logout}
            style={{ padding:'6px 12px', borderRadius:8, border:'1px solid #7A1E17', background:'transparent', color:'#E74C3C', cursor:'pointer', fontSize:11, fontWeight:600, fontFamily:"'Syne'" }}>
            Déco
          </button>
        </div>
      </div>
    </div>
  )
}
