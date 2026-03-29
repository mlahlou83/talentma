import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { save } from '../storage'

const NAV = [
  { path:'/admin/crm',        label:'CRM',         roles:['superadmin','admin','collaborateur'] },
  { path:'/admin/dashboard',  label:'Dashboard',   roles:['superadmin','admin'] },
  { path:'/admin/demandes',   label:'Demandes',    roles:['superadmin','admin','collaborateur'] },
  { path:'/admin/immigration',label:'Immigration', roles:['superadmin','admin'] },
  { path:'/admin/onboarding', label:'Onboarding',  roles:['superadmin','admin'] },
  { path:'/admin/superadmin', label:'Super Admin', roles:['superadmin'] },
]

export default function AdminNav({ session }) {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = async () => { await save('session', null); navigate('/admin') }
  const visible = NAV.filter(item => item.roles.includes(session && session.role))

  return React.createElement('div', {
    style: { background:'#110D06', borderBottom:'1px solid #2A1E12', padding:'0 16px', position:'sticky', top:0, zIndex:50 }
  },
    React.createElement('div', {
      style: { maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', height:52, gap:6, overflowX:'auto' }
    },
      React.createElement('div', { style:{ marginRight:12, flexShrink:0 } },
        React.createElement('div', { style:{ fontSize:13, fontWeight:800, color:'#F0EDE8' } }, 'TalentMA'),
        React.createElement('div', { style:{ fontSize:9, color:'#5A4A3A', letterSpacing:'1px' } }, session && session.username)
      ),
      ...visible.map(item =>
        React.createElement('button', {
          key: item.path,
          onClick: () => navigate(item.path),
          style: {
            padding:'6px 12px', borderRadius:8,
            border: '1px solid '+(location.pathname===item.path?'#C8553D':'#2A1E12'),
            background: location.pathname===item.path?'#C8553D':'transparent',
            color: location.pathname===item.path?'#fff':'#7A6A5A',
            cursor:'pointer', fontSize:12, fontWeight:600,
            fontFamily:"'Syne',sans-serif", whiteSpace:'nowrap', flexShrink:0
          }
        }, item.label)
      ),
      React.createElement('div', { style:{ marginLeft:'auto', display:'flex', gap:6, flexShrink:0 } },
        React.createElement('button', {
          onClick: () => navigate('/'),
          style: { padding:'6px 12px', borderRadius:8, border:'1px solid #0F6E5640', background:'transparent', color:'#0F6E56', cursor:'pointer', fontSize:11, fontFamily:"'Syne',sans-serif" }
        }, 'Portail'),
        React.createElement('button', {
          onClick: logout,
          style: { padding:'6px 12px', borderRadius:8, border:'1px solid #7A1E17', background:'transparent', color:'#E74C3C', cursor:'pointer', fontSize:11, fontFamily:"'Syne',sans-serif" }
        }, 'Deco')
      )
    )
  )
}
