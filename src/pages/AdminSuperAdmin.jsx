import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { load, save } from '../storage'
import AdminNav from '../components/AdminNav'

const DEFAULT_USERS = [
  { id:1, username:'Mohamed',   email:'mohamed@talentma.ma', role:'superadmin', status:'active',  plan:null,       company:null,       subdomain:null },
  { id:2, username:'Collegue',  email:'collab@talentma.ma',  role:'admin',      status:'active',  plan:null,       company:null,       subdomain:null },
  { id:3, username:'Acme Corp', email:'rh@acmecorp.fr',      role:'client',     status:'active',  plan:'Business', company:'Acme Corp', subdomain:'acme' },
  { id:4, username:'OCP Group', email:'talent@ocp.ma',       role:'client',     status:'active',  plan:'Enterprise',company:'OCP Group',subdomain:'ocp' },
  { id:5, username:'StartupXYZ',email:'cto@startupxyz.ma',  role:'client',     status:'suspended',plan:'Starter', company:'StartupXYZ',subdomain:'startupxyz' },
]

const ROLE_COLORS = { superadmin:'#C8553D', admin:'#F0B429', collaborateur:'#7F77DD', client:'#0F6E56' }
const STATUS_COLORS = { active:'#2ECC71', suspended:'#E74C3C', pending:'#F0B429' }

export default function AdminSuperAdmin() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('users')
  const [toast, setToast] = useState('')

  useEffect(() => {
    load('session').then(s => {
      if (!s || s.role !== 'superadmin') { navigate('/admin/crm'); return }
      setSession(s)
    })
    load('sa-users').then(u => setUsers(u || DEFAULT_USERS))
  }, [])

  const flash = msg => { setToast(msg); setTimeout(()=>setToast(''), 2500) }

  const toggleStatus = async user => {
    const next = users.map(u => u.id===user.id ? {...u, status:u.status==='active'?'suspended':'active'} : u)
    setUsers(next)
    await save('sa-users', next)
    flash(user.status==='active'?'Compte suspendu':'Compte reactive')
  }

  const deleteUser = async id => {
    const next = users.filter(u => u.id !== id)
    setUsers(next)
    await save('sa-users', next)
    flash('Compte supprime')
  }

  if (!session) return React.createElement('div', { style:{ minHeight:'100vh', background:'#0D0A06', display:'flex', alignItems:'center', justifyContent:'center', color:'#5A4A3A' } }, 'Chargement...')

  const s = { background:'#110D06', border:'1px solid #2A1E12', borderRadius:8, padding:'6px 12px', color:'#F0EDE8', fontFamily:"'Syne',sans-serif", fontSize:11, outline:'none', cursor:'pointer' }

  const stats = {
    total: users.length,
    clients: users.filter(u=>u.role==='client').length,
    active: users.filter(u=>u.status==='active').length,
    suspended: users.filter(u=>u.status==='suspended').length,
  }

  return React.createElement('div', { style:{ minHeight:'100vh', background:'#0D0A06', fontFamily:"'Syne',sans-serif", color:'#F0EDE8' } },
    React.createElement(AdminNav, { session }),

    toast && React.createElement('div', { style:{ position:'fixed', top:16, right:16, background:'#0D3320', border:'1px solid #1A7A43', borderRadius:10, padding:'10px 18px', fontSize:13, color:'#2ECC71', zIndex:200 } }, toast),

    React.createElement('div', { style:{ maxWidth:960, margin:'0 auto', padding:'14px 16px' } },

      // Stats
      React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 } },
        [['Total',stats.total,'#F0EDE8'],['Clients',stats.clients,'#0F6E56'],['Actifs',stats.active,'#2ECC71'],['Suspendus',stats.suspended,'#E74C3C']].map(([l,v,c]) =>
          React.createElement('div', { key:l, style:{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:12, padding:12, textAlign:'center' } },
            React.createElement('div', { style:{ fontSize:22, fontWeight:800, color:c, fontFamily:'monospace' } }, v),
            React.createElement('div', { style:{ fontSize:10, color:'#5A4A3A' } }, l)
          )
        )
      ),

      // Tabs
      React.createElement('div', { style:{ display:'flex', gap:8, marginBottom:14 } },
        [['users','Comptes'],['plans','Offres']].map(([t,l]) =>
          React.createElement('button', { key:t, onClick:()=>setTab(t), style:{ ...s, borderColor:tab===t?'#C8553D':'#2A1E12', color:tab===t?'#C8553D':'#7A6A5A', background:tab===t?'#C8553D15':'transparent' } }, l)
        )
      ),

      // Users list
      tab === 'users' && React.createElement('div', { style:{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:12, overflow:'hidden' } },
        users.map((u,i) =>
          React.createElement('div', { key:u.id, style:{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid #2A1E12', background:i%2===0?'transparent':'#0D0A0640' } },
            React.createElement('div', { style:{ width:36, height:36, borderRadius:9, background:'#C8553D20', border:'1px solid #C8553D40', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#C8553D', flexShrink:0 } }, u.username[0]),
            React.createElement('div', { style:{ flex:1, minWidth:0 } },
              React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:8, marginBottom:2 } },
                React.createElement('span', { style:{ fontWeight:700, fontSize:13 } }, u.username),
                React.createElement('span', { style:{ display:'inline-flex', padding:'1px 7px', borderRadius:4, fontSize:10, background:ROLE_COLORS[u.role]+'20', color:ROLE_COLORS[u.role] } }, u.role),
                React.createElement('span', { style:{ display:'inline-flex', padding:'1px 7px', borderRadius:4, fontSize:10, color:STATUS_COLORS[u.status] } }, u.status),
                u.plan && React.createElement('span', { style:{ display:'inline-flex', padding:'1px 7px', borderRadius:4, fontSize:10, background:'#1A1008', color:'#7A6A5A', border:'1px solid #2A1E12' } }, u.plan)
              ),
              React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A' } },
                u.email,
                u.subdomain ? ' - '+u.subdomain+'.talentma.ma' : ''
              )
            ),
            React.createElement('div', { style:{ display:'flex', gap:6 } },
              u.role !== 'superadmin' && React.createElement('button', {
                onClick:()=>toggleStatus(u),
                style:{ ...s, color:u.status==='active'?'#E74C3C':'#2ECC71', borderColor:u.status==='active'?'#7A1E17':'#1A7A43' }
              }, u.status==='active'?'Suspendre':'Reactiver'),
              u.role !== 'superadmin' && React.createElement('button', {
                onClick:()=>deleteUser(u.id),
                style:{ ...s, color:'#E74C3C', borderColor:'#7A1E17' }
              }, 'Suppr.')
            )
          )
        )
      ),

      // Plans
      tab === 'plans' && React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 } },
        [
          { name:'Starter', price:'299 MAD/mois', color:'#5BAFD6', features:['1 marche','Freelance uniquement','5 demandes/mois'] },
          { name:'Business', price:'799 MAD/mois', color:'#0F6E56', features:['2 marches','Freelance + CDI Maroc','20 demandes/mois','Logo entreprise'] },
          { name:'Enterprise', price:'1 999 MAD/mois', color:'#C8553D', features:['Tous marches','Tous contrats','Illimite','URL dedicee','Account manager'] },
        ].map(plan =>
          React.createElement('div', { key:plan.name, style:{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:12, padding:18, borderTop:'3px solid '+plan.color } },
            React.createElement('div', { style:{ fontWeight:800, fontSize:16, color:plan.color, marginBottom:4 } }, plan.name),
            React.createElement('div', { style:{ fontSize:13, color:'#7A6A5A', marginBottom:12 } }, plan.price),
            ...plan.features.map(f => React.createElement('div', { key:f, style:{ fontSize:12, color:'#D5BDAC', marginBottom:4 } }, '+ '+f)),
            React.createElement('div', { style:{ marginTop:12, fontSize:11, color:'#5A4A3A' } },
              users.filter(u=>u.plan===plan.name).length+' client(s) actif(s)'
            )
          )
        )
      )
    )
  )
}
