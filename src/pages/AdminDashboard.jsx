import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { load } from '../storage'
import AdminNav from '../components/AdminNav'

const REVENUE_DATA = [
  { month:'Jan', mrr:2990,  placements:2 },
  { month:'Fev', mrr:5980,  placements:3 },
  { month:'Mar', mrr:9770,  placements:5 },
  { month:'Avr', mrr:14550, placements:7 },
  { month:'Mai', mrr:19330, placements:8 },
  { month:'Jun', mrr:25310, placements:11 },
]

const CLIENTS = [
  { company:'Acme Corp',   plan:'Business',   mrr:799,  requests:12, placements:3, status:'active' },
  { company:'OCP Group',   plan:'Enterprise', mrr:1999, requests:34, placements:8, status:'active' },
  { company:'Wafa Bank',   plan:'Business',   mrr:799,  requests:5,  placements:1, status:'active' },
  { company:'StartupXYZ',  plan:'Starter',    mrr:299,  requests:3,  placements:0, status:'suspended' },
  { company:'Capgemini MA',plan:'Enterprise', mrr:1999, requests:28, placements:6, status:'active' },
]

const PLAN_COLORS = { Starter:'#5BAFD6', Business:'#0F6E56', Enterprise:'#C8553D' }
const STATUS_COLORS = { active:'#2ECC71', suspended:'#E74C3C', pending:'#F0B429' }

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    load('session').then(s => { if (!s) navigate('/admin'); else setSession(s) })
  }, [])

  if (!session) return React.createElement('div', { style:{ minHeight:'100vh', background:'#0D0A06', display:'flex', alignItems:'center', justifyContent:'center', color:'#5A4A3A' } }, 'Chargement...')

  const totalMRR = CLIENTS.filter(c=>c.status==='active').reduce((a,c)=>a+c.mrr,0)
  const totalPlacements = CLIENTS.reduce((a,c)=>a+c.placements,0)
  const totalRequests = CLIENTS.reduce((a,c)=>a+c.requests,0)
  const activeClients = CLIENTS.filter(c=>c.status==='active').length

  const s = { background:'#110D06', border:'1px solid #2A1E12', borderRadius:8, padding:'9px 13px', color:'#F0EDE8', fontFamily:"'Syne',sans-serif", fontSize:12, outline:'none', cursor:'pointer' }

  const maxMRR = Math.max(...REVENUE_DATA.map(d=>d.mrr))
  const maxPl = Math.max(...REVENUE_DATA.map(d=>d.placements))

  return React.createElement('div', { style:{ minHeight:'100vh', background:'#0D0A06', fontFamily:"'Syne',sans-serif", color:'#F0EDE8' } },
    React.createElement(AdminNav, { session }),
    React.createElement('div', { style:{ maxWidth:960, margin:'0 auto', padding:'14px 16px' } },

      // KPIs
      React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 } },
        [['MRR',totalMRR.toLocaleString('fr-FR')+' MAD','#C8553D'],['Clients actifs',activeClients,'#2ECC71'],['Placements',totalPlacements,'#5BAFD6'],['Conversion',Math.round((totalPlacements/totalRequests)*100)+'%','#F0B429']].map(([l,v,c]) =>
          React.createElement('div', { key:l, style:{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:12, padding:14, textAlign:'center' } },
            React.createElement('div', { style:{ fontSize:20, fontWeight:800, color:c, fontFamily:'monospace', marginBottom:4 } }, v),
            React.createElement('div', { style:{ fontSize:10, color:'#5A4A3A' } }, l)
          )
        )
      ),

      // Tabs
      React.createElement('div', { style:{ display:'flex', gap:8, marginBottom:14 } },
        [['overview','Vue globale'],['clients','Clients'],['revenus','Revenus']].map(([t,l]) =>
          React.createElement('button', { key:t, onClick:()=>setTab(t), style:{ ...s, borderColor:tab===t?'#C8553D':'#2A1E12', color:tab===t?'#C8553D':'#7A6A5A', background:tab===t?'#C8553D15':'transparent' } }, l)
        )
      ),

      // Overview
      tab==='overview' && React.createElement('div', null,
        React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 } },
          // MRR chart
          React.createElement('div', { style:{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:12, padding:18 } },
            React.createElement('div', { style:{ fontWeight:700, fontSize:14, marginBottom:16 } }, 'Evolution MRR'),
            React.createElement('div', { style:{ display:'flex', alignItems:'flex-end', gap:6, height:80 } },
              REVENUE_DATA.map(d =>
                React.createElement('div', { key:d.month, style:{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 } },
                  React.createElement('div', { style:{ width:'100%', background:'#C8553D30', borderRadius:'3px 3px 0 0', position:'relative', height:64 } },
                    React.createElement('div', { style:{ position:'absolute', bottom:0, left:0, right:0, background:'#C8553D', borderRadius:'3px 3px 0 0', height:(d.mrr/maxMRR*100)+'%' } })
                  ),
                  React.createElement('div', { style:{ fontSize:8, color:'#5A4A3A' } }, d.month)
                )
              )
            )
          ),
          // Placements chart
          React.createElement('div', { style:{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:12, padding:18 } },
            React.createElement('div', { style:{ fontWeight:700, fontSize:14, marginBottom:16 } }, 'Placements'),
            React.createElement('div', { style:{ display:'flex', alignItems:'flex-end', gap:6, height:80 } },
              REVENUE_DATA.map(d =>
                React.createElement('div', { key:d.month, style:{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 } },
                  React.createElement('div', { style:{ width:'100%', background:'#0F6E5630', borderRadius:'3px 3px 0 0', position:'relative', height:64 } },
                    React.createElement('div', { style:{ position:'absolute', bottom:0, left:0, right:0, background:'#0F6E56', borderRadius:'3px 3px 0 0', height:(d.placements/maxPl*100)+'%' } })
                  ),
                  React.createElement('div', { style:{ fontSize:8, color:'#5A4A3A' } }, d.month)
                )
              )
            )
          )
        )
      ),

      // Clients
      tab==='clients' && React.createElement('div', { style:{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:12, overflow:'hidden' } },
        React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', padding:'10px 14px', borderBottom:'1px solid #2A1E12', fontSize:10, color:'#5A4A3A', fontWeight:700 } },
          ['SOCIETE','OFFRE','MRR','DEMANDES','STATUT'].map(h => React.createElement('span', { key:h }, h))
        ),
        ...CLIENTS.map((c,i) =>
          React.createElement('div', { key:c.company, style:{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', padding:'12px 14px', borderBottom:'1px solid #2A1E12', alignItems:'center', background:i%2===0?'transparent':'#0D0A0650' } },
            React.createElement('span', { style:{ fontWeight:600, fontSize:13 } }, c.company),
            React.createElement('span', { style:{ fontSize:11, color:PLAN_COLORS[c.plan] } }, c.plan),
            React.createElement('span', { style:{ fontFamily:'monospace', color:'#C8553D', fontWeight:700, fontSize:13 } }, c.mrr.toLocaleString('fr-FR')+' MAD'),
            React.createElement('span', { style:{ fontSize:13 } }, c.requests),
            React.createElement('span', { style:{ fontSize:11, color:STATUS_COLORS[c.status] } }, c.status==='active'?'Actif':c.status==='suspended'?'Suspendu':'Attente')
          )
        )
      ),

      // Revenus
      tab==='revenus' && React.createElement('div', { style:{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:12, overflow:'hidden' } },
        React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'10px 14px', borderBottom:'1px solid #2A1E12', fontSize:10, color:'#5A4A3A', fontWeight:700 } },
          ['MOIS','MRR','PLACEMENTS'].map(h => React.createElement('span', { key:h }, h))
        ),
        ...REVENUE_DATA.map((d,i) =>
          React.createElement('div', { key:d.month, style:{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'12px 14px', borderBottom:'1px solid #2A1E12', background:i%2===0?'transparent':'#0D0A0650' } },
            React.createElement('span', { style:{ fontSize:13 } }, d.month+' 2026'),
            React.createElement('span', { style:{ fontFamily:'monospace', color:'#C8553D', fontWeight:700 } }, d.mrr.toLocaleString('fr-FR')+' MAD'),
            React.createElement('span', { style:{ fontSize:13 } }, d.placements)
          )
        )
      )
    )
  )
}
