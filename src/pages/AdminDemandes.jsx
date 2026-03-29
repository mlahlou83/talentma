import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { load } from '../storage'
import { useEffect } from 'react'
import AdminNav from '../components/AdminNav'

const REQUESTS = [
  { id:1, clientCompany:'Acme Corp', clientEmail:'marie@acmecorp.fr', talent:'Karim Ouazzani', domain:'Dev', skills:['React','Node.js'], contrat:'Freelance', dispo:true, status:'pending', priority:'high', message:'Besoin urgent dev React pour mission 3 mois.', adminNote:'' },
  { id:2, clientCompany:'OCP Group', clientEmail:'a.benali@ocp.ma', talent:'Rania Kettani', domain:'Data', skills:['Power BI','SQL'], contrat:'CDI Maroc', dispo:true, status:'contacted', priority:'medium', message:'Poste Data Analyst CDI Casablanca.', adminNote:'Entretien planifie le 2 avril 14h.' },
  { id:3, clientCompany:'Capgemini MA', clientEmail:'y.kettani@capgemini.com', talent:'Mehdi Tazi', domain:'Data', skills:['Python','ML'], contrat:'CDI France', dispo:false, status:'pending', priority:'low', message:'Data scientist Paris. Visa talent necessaire.', adminNote:'' },
  { id:4, clientCompany:'Wafa Bank', clientEmail:'f.tazi@wafabank.ma', talent:'Yasmine Benali', domain:'Design', skills:['Figma'], contrat:'Freelance', dispo:true, status:'closed_won', priority:'medium', message:'Refonte app mobile Wafa. Mission 6 mois.', adminNote:'Mission signee ! TJM 650 EUR/j.' },
]

const STATUS = {
  pending:     { label:'En attente', color:'#F0B429', bg:'#2D2000' },
  contacted:   { label:'Contacte',   color:'#5BAFD6', bg:'#0A1A28' },
  closed_won:  { label:'Place',      color:'#2ECC71', bg:'#0D3320' },
  closed_lost: { label:'Non conclu', color:'#E74C3C', bg:'#2D0D0D' },
}

const PRIORITY = {
  high:   { label:'Urgent', color:'#E74C3C' },
  medium: { label:'Normal', color:'#F0B429' },
  low:    { label:'Bas',    color:'#5A4A3A' },
}

export default function AdminDemandes() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [requests, setRequests] = useState(REQUESTS)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    load('session').then(s => { if (!s) navigate('/admin'); else setSession(s) })
  }, [])

  if (!session) return React.createElement('div', { style:{ minHeight:'100vh', background:'#0D0A06', display:'flex', alignItems:'center', justifyContent:'center', color:'#5A4A3A' } }, 'Chargement...')

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)
  const s = { background:'#110D06', border:'1px solid #2A1E12', borderRadius:8, padding:'6px 12px', color:'#F0EDE8', fontFamily:"'Syne',sans-serif", fontSize:12, outline:'none', cursor:'pointer' }

  const updateStatus = (id, status) => setRequests(rs => rs.map(r => r.id===id ? {...r, status} : r))

  return React.createElement('div', { style:{ minHeight:'100vh', background:'#0D0A06', fontFamily:"'Syne',sans-serif", color:'#F0EDE8' } },
    React.createElement(AdminNav, { session }),
    React.createElement('div', { style:{ maxWidth:900, margin:'0 auto', padding:'14px 16px' } },

      // Stats
      React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 } },
        [['Total',requests.length,'#F0EDE8'],['En attente',requests.filter(r=>r.status==='pending').length,'#F0B429'],['Places',requests.filter(r=>r.status==='closed_won').length,'#2ECC71'],['Contacts',requests.filter(r=>r.status==='contacted').length,'#5BAFD6']].map(([l,v,c]) =>
          React.createElement('div', { key:l, style:{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:12, padding:'10px', textAlign:'center' } },
            React.createElement('div', { style:{ fontSize:20, fontWeight:800, color:c, fontFamily:'monospace' } }, v),
            React.createElement('div', { style:{ fontSize:9, color:'#5A4A3A' } }, l)
          )
        )
      ),

      // Filters
      React.createElement('div', { style:{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' } },
        [['all','Toutes'],['pending','En attente'],['contacted','Contacte'],['closed_won','Places']].map(([k,l]) =>
          React.createElement('button', { key:k, onClick:()=>setFilter(k), style:{ ...s, borderColor:filter===k?'#C8553D':'#2A1E12', color:filter===k?'#C8553D':'#7A6A5A', background:filter===k?'#C8553D15':'transparent' } }, l)
        )
      ),

      // List
      React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:10 } },
        filtered.map(r => {
          const sc = STATUS[r.status] || STATUS.pending
          const pc = PRIORITY[r.priority] || PRIORITY.medium
          return React.createElement('div', { key:r.id,
            style:{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:12, padding:'14px 16px', borderLeft:'3px solid '+sc.color }
          },
            React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 } },
              React.createElement('div', null,
                React.createElement('div', { style:{ display:'flex', gap:8, alignItems:'center', marginBottom:4 } },
                  React.createElement('span', { style:{ fontWeight:700, fontSize:13 } }, r.clientCompany),
                  React.createElement('span', { style:{ fontSize:11, color:'#5A4A3A' } }, '->' ),
                  React.createElement('span', { style:{ fontWeight:600, fontSize:13, color:'#C8553D' } }, r.talent),
                  React.createElement('span', { style:{ display:'inline-flex', padding:'2px 8px', borderRadius:4, fontSize:10, background:sc.bg, color:sc.color } }, sc.label),
                  React.createElement('span', { style:{ fontSize:10, color:pc.color } }, pc.label)
                ),
                React.createElement('div', { style:{ fontSize:12, color:'#7A6A5A', marginBottom:4 } }, r.message),
                React.createElement('div', { style:{ display:'flex', gap:8, fontSize:11, color:'#5A4A3A' } },
                  React.createElement('span', null, r.domain),
                  React.createElement('span', null, r.contrat),
                  React.createElement('span', { style:{ color:r.dispo?'#2ECC71':'#E74C3C' } }, r.dispo?'Disponible':'Occupe')
                ),
                r.adminNote && React.createElement('div', { style:{ marginTop:6, fontSize:11, color:'#7F77DD', background:'#16123A', padding:'5px 9px', borderRadius:6 } }, r.adminNote)
              ),
              React.createElement('div', { style:{ display:'flex', gap:6, flexShrink:0 } },
                r.status === 'pending' && React.createElement('button', {
                  onClick:()=>updateStatus(r.id,'contacted'),
                  style:{ ...s, background:'#0F6E56', color:'#fff', border:'none', fontSize:11 }
                }, 'Marquer contacte'),
                r.status === 'contacted' && React.createElement('button', {
                  onClick:()=>updateStatus(r.id,'closed_won'),
                  style:{ ...s, background:'#C8553D', color:'#fff', border:'none', fontSize:11 }
                }, 'Marquer place')
              )
            )
          )
        })
      )
    )
  )
}
