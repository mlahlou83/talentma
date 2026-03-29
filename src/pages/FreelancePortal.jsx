import React, { useState, useEffect } from 'react'
import { load, save } from '../storage'
import { scoreProfile, DEFAULT_WEIGHTS } from '../data'

const STEPS = ['Profil','Competences','Experience','Disponibilite','Confirmation']
const DOMAINS = ['Dev','Design','Data','Marketing','Finance','Autre']
const SKILLS = { Dev:['React','Vue.js','Node.js','Laravel','Python','TypeScript','Flutter','React Native'], Design:['Figma','Adobe XD','Illustrator','Branding','UI/UX'], Data:['Python','SQL','Power BI','Tableau','Machine Learning'], Marketing:['SEO','Google Ads','Analytics','CRM'], Finance:['Excel','Sage','SAP','Audit'], Autre:[] }
const CONTRACTS = [{ id:'freelance',label:'Freelance',desc:'Missions courtes ou longues' },{ id:'cdi_maroc',label:'CDI Maroc',desc:'Poste permanent au Maroc' },{ id:'cdi_france',label:'CDI France',desc:'France avec visa accompagne' }]

export default function FreelancePortal() {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', location:'', linkedinUrl:'', contractType:'freelance', domain:'Dev', skills:[], education:'', experience:'', disponible:true })

  useEffect(() => { load('freelance-profile').then(p => { if(p) setProfile(p) }) }, [])

  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const toggleSkill = s => set('skills', form.skills.includes(s)?form.skills.filter(x=>x!==s):[...form.skills,s])

  const handleSubmit = async () => {
    const scored = scoreProfile(form, DEFAULT_WEIGHTS)
    const p = { ...scored, id:Date.now(), screened:false, pipelineStage:'nouveau', createdAt:new Date().toISOString() }
    await save('freelance-profile', p)
    const all = await load('freelance-submissions') || []
    await save('freelance-submissions', [...all, p])
    setProfile(p)
    setDone(true)
  }

  const inp = { background:'#110D06', border:'1px solid #2A1E12', borderRadius:8, padding:'10px 14px', color:'#F0EDE8', fontFamily:"'Syne',sans-serif", fontSize:13, outline:'none', width:'100%' }

  if (profile && !done) return React.createElement('div', { style:{ minHeight:'100vh', background:'#0D0A06', fontFamily:"'Syne',sans-serif", color:'#F0EDE8' } },
    React.createElement('div', { style:{ background:'#110D06', borderBottom:'1px solid #2A1E12', padding:'0 16px' } },
      React.createElement('div', { style:{ maxWidth:600, margin:'0 auto', display:'flex', alignItems:'center', height:54, gap:12 } },
        React.createElement('div', { style:{ fontSize:16, fontWeight:800 } }, 'TalentMA'),
        React.createElement('div', { style:{ fontSize:9, color:'#5A4A3A' } }, 'ESPACE FREELANCE')
      )
    ),
    React.createElement('div', { style:{ maxWidth:600, margin:'0 auto', padding:20 } },
      React.createElement('div', { style:{ background:'#0D3320', border:'1px solid #1A7A43', borderRadius:12, padding:16, marginBottom:20 } },
        React.createElement('div', { style:{ fontWeight:700, color:'#2ECC71', marginBottom:4 } }, 'Profil enregistre'),
        React.createElement('div', { style:{ fontSize:12, color:'#9FE1CB' } }, 'Notre equipe examine votre profil sous 48h.')
      ),
      React.createElement('div', { style:{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:12, padding:20 } },
        React.createElement('div', { style:{ fontWeight:800, fontSize:18, marginBottom:4 } }, profile.firstName+' '+profile.lastName),
        React.createElement('div', { style:{ fontSize:12, color:'#7A6A5A', marginBottom:12 } }, profile.domain+' - '+profile.contractType),
        React.createElement('div', { style:{ fontSize:24, fontWeight:800, color:'#C8553D', fontFamily:'monospace', marginBottom:4 } }, (profile.score||0)+'pts'),
        React.createElement('div', { style:{ fontSize:12, color:'#5A4A3A', marginBottom:14 } }, 'Score de probabilite marocaine'),
        (profile.skills||[]).length>0 && React.createElement('div', { style:{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 } },
          (profile.skills||[]).map(s => React.createElement('span', { key:s, style:{ display:'inline-flex', padding:'3px 10px', borderRadius:4, fontSize:11, background:'#1E1208', color:'#D5BDAC', border:'1px solid #2A1E12' } }, s))
        ),
        React.createElement('div', { style:{ background:'#1E1400', border:'1px solid #5C3D00', borderRadius:8, padding:12, fontSize:12, color:'#F0B429' } }, 'Statut : En cours d examen - Vous serez contacte bientot.'),
        React.createElement('button', { onClick:()=>setProfile(null), style:{ width:'100%', marginTop:14, padding:10, background:'transparent', border:'1px solid #2A1E12', borderRadius:8, color:'#7A6A5A', cursor:'pointer', fontFamily:"'Syne',sans-serif" } }, 'Modifier mon profil')
      )
    )
  )

  if (done) return React.createElement('div', { style:{ minHeight:'100vh', background:'#0D0A06', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Syne',sans-serif", color:'#F0EDE8' } },
    React.createElement('div', { style:{ maxWidth:440, width:'100%', textAlign:'center' } },
      React.createElement('div', { style:{ fontSize:56, marginBottom:16 } }, 'OK'),
      React.createElement('div', { style:{ fontSize:22, fontWeight:800, marginBottom:8 } }, 'Profil soumis !'),
      React.createElement('div', { style:{ fontSize:13, color:'#7A6A5A', marginBottom:24 } }, 'Merci '+form.firstName+'. Notre equipe vous contactera sous 48h.'),
      React.createElement('button', { onClick:()=>setDone(false), style:{ background:'#C8553D', color:'#fff', border:'none', borderRadius:8, padding:'12px 24px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Syne',sans-serif" } }, 'Voir mon profil')
    )
  )

  return React.createElement('div', { style:{ minHeight:'100vh', background:'#0D0A06', fontFamily:"'Syne',sans-serif", color:'#F0EDE8' } },
    React.createElement('div', { style:{ background:'#110D06', borderBottom:'1px solid #2A1E12', padding:'0 16px' } },
      React.createElement('div', { style:{ maxWidth:600, margin:'0 auto', display:'flex', alignItems:'center', height:54 } },
        React.createElement('div', { style:{ fontSize:16, fontWeight:800 } }, 'TalentMA - Inscription Freelance')
      )
    ),
    React.createElement('div', { style:{ maxWidth:600, margin:'0 auto', padding:'20px 16px' } },

      // Progress
      React.createElement('div', { style:{ marginBottom:24 } },
        React.createElement('div', { style:{ display:'flex', gap:4, marginBottom:6 } },
          STEPS.map((s,i) => React.createElement('div', { key:s, style:{ flex:1, textAlign:'center', fontSize:9, color:i===step?'#C8553D':'#5A4A3A', fontWeight:i===step?700:400 } }, s))
        ),
        React.createElement('div', { style:{ height:3, background:'#1E1208', borderRadius:2 } },
          React.createElement('div', { style:{ height:'100%', width:(step/4*100)+'%', background:'#C8553D', borderRadius:2 } })
        )
      ),

      // Step 0
      step===0 && React.createElement('div', null,
        React.createElement('div', { style:{ fontWeight:800, fontSize:20, marginBottom:16 } }, 'Votre profil'),
        React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 } },
          React.createElement('div', null, React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:5 } }, 'PRENOM *'), React.createElement('input', { style:inp, placeholder:'Karim', value:form.firstName, onChange:e=>set('firstName',e.target.value) })),
          React.createElement('div', null, React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:5 } }, 'NOM *'), React.createElement('input', { style:inp, placeholder:'Ouazzani', value:form.lastName, onChange:e=>set('lastName',e.target.value) }))
        ),
        React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 } },
          React.createElement('div', null, React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:5 } }, 'EMAIL *'), React.createElement('input', { style:inp, type:'email', placeholder:'karim@email.com', value:form.email, onChange:e=>set('email',e.target.value) })),
          React.createElement('div', null, React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:5 } }, 'TELEPHONE'), React.createElement('input', { style:inp, placeholder:'+212 6...', value:form.phone, onChange:e=>set('phone',e.target.value) }))
        ),
        React.createElement('div', { style:{ marginBottom:14 } }, React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:5 } }, 'VILLE'), React.createElement('input', { style:inp, placeholder:'Casablanca, Maroc', value:form.location, onChange:e=>set('location',e.target.value) })),
        React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:10 } }, 'TYPE DE CONTRAT'),
        React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
          CONTRACTS.map(c => React.createElement('div', { key:c.id, onClick:()=>set('contractType',c.id),
            style:{ border:'2px solid '+(form.contractType===c.id?'#C8553D':'#2A1E12'), borderRadius:10, padding:12, cursor:'pointer', background:form.contractType===c.id?'#C8553D10':'#110D06' }
          },
            React.createElement('div', { style:{ fontWeight:700, color:form.contractType===c.id?'#C8553D':'#F0EDE8' } }, c.label),
            React.createElement('div', { style:{ fontSize:11, color:'#7A6A5A' } }, c.desc)
          ))
        )
      ),

      // Step 1
      step===1 && React.createElement('div', null,
        React.createElement('div', { style:{ fontWeight:800, fontSize:20, marginBottom:16 } }, 'Vos competences'),
        React.createElement('div', { style:{ marginBottom:16 } },
          React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:10 } }, 'DOMAINE'),
          React.createElement('div', { style:{ display:'flex', gap:8, flexWrap:'wrap' } },
            DOMAINS.map(d => React.createElement('button', { key:d, onClick:()=>{set('domain',d);set('skills',[])},
              style:{ padding:'8px 16px', borderRadius:8, border:'2px solid '+(form.domain===d?'#C8553D':'#2A1E12'), background:form.domain===d?'#C8553D15':'#110D06', color:form.domain===d?'#C8553D':'#7A6A5A', cursor:'pointer', fontFamily:"'Syne',sans-serif", fontSize:13 }
            }, d))
          )
        ),
        React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:8 } }, 'COMPETENCES ('+form.skills.length+' selectionnees)'),
        React.createElement('div', { style:{ background:'#110D06', borderRadius:10, padding:14, display:'flex', flexWrap:'wrap', gap:7 } },
          (SKILLS[form.domain]||[]).map(s => React.createElement('span', { key:s, onClick:()=>toggleSkill(s),
            style:{ fontSize:11, padding:'4px 11px', borderRadius:5, cursor:'pointer', background:form.skills.includes(s)?'#C8553D20':'#1E1208', color:form.skills.includes(s)?'#C8553D':'#7A6A5A', border:'1px solid '+(form.skills.includes(s)?'#C8553D50':'#2A1E12') }
          }, (form.skills.includes(s)?'+ ':'')+s))
        )
      ),

      // Step 2
      step===2 && React.createElement('div', null,
        React.createElement('div', { style:{ fontWeight:800, fontSize:20, marginBottom:16 } }, 'Votre parcours'),
        React.createElement('div', { style:{ marginBottom:12 } }, React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:5 } }, 'FORMATIONS ET ECOLES *'), React.createElement('textarea', { style:{...inp,resize:'vertical',minHeight:80}, placeholder:'Ex: Universite Mohammed V Rabat, ISCAE Casablanca...', value:form.education, onChange:e=>set('education',e.target.value) })),
        React.createElement('div', null, React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:5 } }, 'EXPERIENCES'), React.createElement('textarea', { style:{...inp,resize:'vertical',minHeight:80}, placeholder:'Ex: OCP Maroc 2019-2021, Capgemini Paris 2021-2023...', value:form.experience, onChange:e=>set('experience',e.target.value) }))
      ),

      // Step 3
      step===3 && React.createElement('div', null,
        React.createElement('div', { style:{ fontWeight:800, fontSize:20, marginBottom:16 } }, 'Disponibilite'),
        React.createElement('div', { style:{ display:'flex', gap:10, marginBottom:20 } },
          [[true,'Disponible maintenant'],[false,'Prochainement']].map(([v,l]) => React.createElement('div', { key:String(v), onClick:()=>set('disponible',v),
            style:{ flex:1, border:'2px solid '+(form.disponible===v?'#C8553D':'#2A1E12'), borderRadius:10, padding:14, cursor:'pointer', background:form.disponible===v?'#C8553D10':'#110D06', textAlign:'center' }
          },
            React.createElement('div', { style:{ fontWeight:700, color:form.disponible===v?'#C8553D':'#F0EDE8' } }, l)
          ))
        ),
        React.createElement('div', { style:{ background:'#110D06', borderRadius:10, padding:16, border:'1px solid #2A1E12' } },
          React.createElement('div', { style:{ fontSize:11, color:'#5A4A3A', marginBottom:8, fontWeight:700 } }, 'RECAPITULATIF'),
          [form.firstName+' '+form.lastName, form.email, form.domain, form.skills.length+' competence(s)', form.contractType, form.disponible?'Disponible':'Prochainement'].map((v,i) =>
            React.createElement('div', { key:i, style:{ fontSize:12, color:'#D5BDAC', marginBottom:4 } }, v)
          )
        )
      ),

      // Nav
      React.createElement('div', { style:{ display:'flex', gap:12, marginTop:24 } },
        step>0 && React.createElement('button', { onClick:()=>setStep(s=>s-1), style:{ flex:1, padding:12, background:'transparent', border:'1px solid #2A1E12', borderRadius:8, color:'#7A6A5A', cursor:'pointer', fontFamily:"'Syne',sans-serif" } }, 'Retour'),
        step<4
          ? React.createElement('button', { onClick:()=>setStep(s=>s+1), disabled:step===0&&(!form.firstName||!form.lastName||!form.email), style:{ flex:2, padding:12, background:'#C8553D', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700 } }, 'Continuer')
          : React.createElement('button', { onClick:handleSubmit, style:{ flex:2, padding:12, background:'#0F6E56', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700 } }, 'Soumettre mon profil')
      )
    )
  )
}
