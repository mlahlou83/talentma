import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { load, save } from '../storage'
import AdminNav from '../components/AdminNav'

const PLANS = [
  { id:'starter',    label:'Starter',    price:'299 MAD/mois',  color:'#5BAFD6', marches:['maroc'], contracts:['freelance'], quota:5 },
  { id:'business',   label:'Business',   price:'799 MAD/mois',  color:'#0F6E56', marches:['maroc','france'], contracts:['freelance','cdi_maroc'], quota:20 },
  { id:'enterprise', label:'Enterprise', price:'1 999 MAD/mois', color:'#C8553D', marches:['maroc','france'], contracts:['freelance','cdi_maroc','cdi_france'], quota:999 },
]

const STEPS = ['Entreprise','Offre','Configuration','Acces','Confirmation']

export default function AdminOnboarding() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    company:'', email:'', contactName:'', planId:'business',
    subdomain:'', adminEmail:'', adminPassword:'',
    marches:['maroc','france'], contracts:['freelance','cdi_maroc'], quota:20
  })

  useEffect(() => {
    load('session').then(s => { if (!s) navigate('/admin'); else setSession(s) })
  }, [])

  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const applyPlan = planId => {
    const p = PLANS.find(p=>p.id===planId)
    if (p) setForm(prev=>({...prev, planId, marches:p.marches, contracts:p.contracts, quota:p.quota}))
  }

  const canNext = () => {
    if(step===0) return form.company && form.email && form.contactName
    if(step===3) return form.subdomain && form.adminEmail && form.adminPassword
    return true
  }

  if (!session) return React.createElement('div', { style:{ minHeight:'100vh', background:'#0D0A06', display:'flex', alignItems:'center', justifyContent:'center', color:'#5A4A3A' } }, 'Chargement...')

  const inp = { background:'#110D06', border:'1px solid #2A1E12', borderRadius:8, padding:'10px 14px', color:'#F0EDE8', fontFamily:"'Syne',sans-serif", fontSize:13, outline:'none', width:'100%' }
  const plan = PLANS.find(p=>p.id===form.planId) || PLANS[1]

  if (done) return React.createElement('div', { style:{ minHeight:'100vh', background:'#0D0A06', fontFamily:"'Syne',sans-serif", color:'#F0EDE8' } },
    React.createElement(AdminNav, { session }),
    React.createElement('div', { style:{ maxWidth:500, margin:'60px auto', padding:20, textAlign:'center' } },
      React.createElement('div', { style:{ fontSize:48, marginBottom:20 } }, 'OK'),
      React.createElement('div', { style:{ fontSize:22, fontWeight:800, marginBottom:8 } }, 'Compte cree !'),
      React.createElement('div', { style:{ fontSize:13, color:'#7A6A5A', marginBottom:24 } }, 'Le portail de '+form.company+' est pret sur https://'+form.subdomain+'.talentma.ma'),
      React.createElement('button', { onClick:()=>{setDone(false);setStep(0);setForm({company:'',email:'',contactName:'',planId:'business',subdomain:'',adminEmail:'',adminPassword:'',marches:['maroc','france'],contracts:['freelance','cdi_maroc'],quota:20})},
        style:{ background:'#C8553D', color:'#fff', border:'none', borderRadius:8, padding:'12px 24px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Syne',sans-serif" }
      }, 'Creer un autre compte')
    )
  )

  return React.createElement('div', { style:{ minHeight:'100vh', background:'#0D0A06', fontFamily:"'Syne',sans-serif", color:'#F0EDE8' } },
    React.createElement(AdminNav, { session }),
    React.createElement('div', { style:{ maxWidth:600, margin:'0 auto', padding:'20px 16px' } },

      // Progress
      React.createElement('div', { style:{ display:'flex', alignItems:'center', marginBottom:28 } },
        STEPS.map((s,i) =>
          React.createElement('div', { key:s, style:{ display:'flex', alignItems:'center', flex:i<STEPS.length-1?1:'initial' } },
            React.createElement('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center' } },
              React.createElement('div', { style:{ width:32, height:32, borderRadius:10, background:i<step?'#C8553D':i===step?'#C8553D15':'#1E1208', border:'2px solid '+(i<=step?'#C8553D':'#2A1E12'), display:'flex', alignItems:'center', justifyContent:'center', fontSize:i<step?14:12, color:i<=step?i<step?'#fff':'#C8553D':'#5A4A3A' } }, i<step?'V':(i+1)),
              React.createElement('div', { style:{ fontSize:8, color:i===step?'#C8553D':'#5A4A3A', marginTop:3, whiteSpace:'nowrap' } }, s)
            ),
            i<STEPS.length-1 && React.createElement('div', { style:{ flex:1, height:2, background:i<step?'#C8553D30':'#2A1E12', margin:'0 4px', marginBottom:14 } })
          )
        )
      ),

      // Step 0
      step===0 && React.createElement('div', null,
        React.createElement('div', { style:{ fontWeight:800, fontSize:20, marginBottom:16 } }, "L'entreprise cliente"),
        React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 } },
          React.createElement('div', null, React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:5 } }, 'NOM *'), React.createElement('input', { style:inp, placeholder:'Acme Corp', value:form.company, onChange:e=>set('company',e.target.value) })),
          React.createElement('div', null, React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:5 } }, 'EMAIL *'), React.createElement('input', { style:inp, type:'email', placeholder:'rh@acme.fr', value:form.email, onChange:e=>set('email',e.target.value) }))
        ),
        React.createElement('div', null, React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:5 } }, 'CONTACT *'), React.createElement('input', { style:inp, placeholder:'Marie Dupont', value:form.contactName, onChange:e=>set('contactName',e.target.value) }))
      ),

      // Step 1 - Plan
      step===1 && React.createElement('div', null,
        React.createElement('div', { style:{ fontWeight:800, fontSize:20, marginBottom:16 } }, "Choix de l'offre"),
        React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:10 } },
          PLANS.map(p =>
            React.createElement('div', { key:p.id, onClick:()=>applyPlan(p.id),
              style:{ border:'2px solid '+(form.planId===p.id?p.color:'#2A1E12'), borderRadius:12, padding:16, cursor:'pointer', background:form.planId===p.id?p.color+'10':'#110D06' }
            },
              React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center' } },
                React.createElement('div', { style:{ fontWeight:800, fontSize:16, color:form.planId===p.id?p.color:'#F0EDE8' } }, p.label),
                React.createElement('div', { style:{ fontFamily:'monospace', color:p.color, fontWeight:700 } }, p.price)
              )
            )
          )
        )
      ),

      // Step 2 - Config
      step===2 && React.createElement('div', null,
        React.createElement('div', { style:{ fontWeight:800, fontSize:20, marginBottom:16 } }, 'Configuration'),
        React.createElement('div', { style:{ background:'#110D06', borderRadius:10, padding:14, marginBottom:12 } },
          React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:8 } }, 'QUOTA MENSUEL'),
          React.createElement('input', { style:{...inp,marginBottom:4}, type:'number', value:form.quota, onChange:e=>set('quota',Number(e.target.value)) }),
          React.createElement('div', { style:{ fontSize:10, color:'#3A2A18' } }, '999 = illimite')
        ),
        React.createElement('div', { style:{ background:'#110D06', borderRadius:10, padding:14 } },
          React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:8 } }, 'MARCHES'),
          React.createElement('div', { style:{ fontSize:13 } }, form.marches.join(', '))
        )
      ),

      // Step 3 - Access
      step===3 && React.createElement('div', null,
        React.createElement('div', { style:{ fontWeight:800, fontSize:20, marginBottom:16 } }, 'Acces et connexion'),
        React.createElement('div', { style:{ marginBottom:12 } },
          React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:5 } }, 'SOUS-DOMAINE *'),
          React.createElement('div', { style:{ display:'flex', alignItems:'center' } },
            React.createElement('input', { style:{...inp,borderRadius:'8px 0 0 8px',borderRight:'none'}, placeholder:'acme', value:form.subdomain, onChange:e=>set('subdomain',e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'')) }),
            React.createElement('span', { style:{ background:'#1A1008', border:'1px solid #2A1E12', borderLeft:'none', borderRadius:'0 8px 8px 0', padding:'10px 12px', fontSize:11, color:'#5A4A3A', whiteSpace:'nowrap' } }, '.talentma.ma')
          )
        ),
        React.createElement('div', { style:{ marginBottom:12 } }, React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:5 } }, 'EMAIL ADMIN *'), React.createElement('input', { style:inp, type:'email', placeholder:'admin@acme.fr', value:form.adminEmail, onChange:e=>set('adminEmail',e.target.value) })),
        React.createElement('div', null, React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:5 } }, 'MOT DE PASSE *'), React.createElement('input', { style:inp, type:'password', placeholder:'Mot de passe', value:form.adminPassword, onChange:e=>set('adminPassword',e.target.value) }))
      ),

      // Step 4 - Recap
      step===4 && React.createElement('div', null,
        React.createElement('div', { style:{ fontWeight:800, fontSize:20, marginBottom:16 } }, 'Confirmation'),
        React.createElement('div', { style:{ background:'#110D06', borderRadius:12, padding:16 } },
          [['Societe',form.company],['Email',form.email],['Plan',plan.label+' - '+plan.price],['URL',form.subdomain+'.talentma.ma'],['Admin',form.adminEmail],['Quota',form.quota===999?'Illimite':form.quota+' dem/mois']].map(([l,v]) =>
            React.createElement('div', { key:l, style:{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #2A1E12', fontSize:12 } },
              React.createElement('span', { style:{ color:'#5A4A3A' } }, l),
              React.createElement('span', { style:{ fontWeight:600 } }, v)
            )
          )
        )
      ),

      // Navigation
      React.createElement('div', { style:{ display:'flex', gap:12, marginTop:24 } },
        step > 0 && React.createElement('button', { onClick:()=>setStep(s=>s-1),
          style:{ flex:1, padding:12, background:'transparent', border:'1px solid #2A1E12', borderRadius:8, color:'#7A6A5A', cursor:'pointer', fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:600 }
        }, 'Retour'),
        step < 4
          ? React.createElement('button', { onClick:()=>setStep(s=>s+1), disabled:!canNext(),
              style:{ flex:2, padding:12, background:canNext()?'#C8553D':'#2A1E12', color:canNext()?'#fff':'#5A4A3A', border:'none', borderRadius:8, cursor:canNext()?'pointer':'not-allowed', fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700 }
            }, 'Continuer')
          : React.createElement('button', { onClick:()=>setDone(true),
              style:{ flex:2, padding:12, background:'#0F6E56', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700 }
            }, 'Creer le compte client')
      )
    )
  )
}
