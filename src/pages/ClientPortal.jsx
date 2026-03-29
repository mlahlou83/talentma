import React, { useState, useMemo, useEffect } from 'react'
import { load, save } from '../storage'
import { scoreProfile, DEFAULT_WEIGHTS, CONTRACTS_DEFAULT, SAMPLE_PROFILES } from '../data'

export default function ClientPortal() {
  const [profiles, setProfiles] = useState([])
  const [contracts] = useState(CONTRACTS_DEFAULT)
  const [search, setSearch] = useState('')
  const [domain, setDomain] = useState('Tous')
  const [contract, setContract] = useState('Tous')
  const [dispoOnly, setDispoOnly] = useState(false)
  const [certOnly, setCertOnly] = useState(false)
  const [selected, setSelected] = useState(null)
  const [requested, setRequested] = useState(new Set())

  useEffect(() => {
    load('tm-profiles').then(p => {
      if (p && p.length) setProfiles(p)
      else setProfiles(SAMPLE_PROFILES.map(x => scoreProfile(x, DEFAULT_WEIGHTS)))
    })
  }, [])

  const filtered = useMemo(() => profiles.filter(p => {
    const q = search.toLowerCase()
    return (!q || (p.firstName+' '+p.lastName+' '+p.headline+' '+(p.domain||'')).toLowerCase().includes(q))
      && (domain === 'Tous' || p.domain === domain)
      && (contract === 'Tous' || p.contractType === contract)
      && (!dispoOnly || p.disponible)
      && (!certOnly || p.screened)
  }), [profiles, search, domain, contract, dispoOnly, certOnly])

  const handleRequest = async (p) => {
    setRequested(r => new Set([...r, p.id]))
    const reqs = await load('client-requests') || []
    await save('client-requests', [...reqs, { profileId:p.id, name:p.firstName+' '+p.lastName, date:new Date().toISOString() }])
  }

  const ct = id => contracts.find(c=>c.id===id) || { label:'--', color:'#888', bg:'#222' }
  const inp = { background:'#110D06', border:'1px solid #2A1E12', borderRadius:8, padding:'9px 13px', color:'#F0EDE8', fontFamily:"'Syne',sans-serif", fontSize:13, outline:'none' }

  return React.createElement('div', { style:{ minHeight:'100vh', background:'#0D0A06', fontFamily:"'Syne',sans-serif", color:'#F0EDE8' } },

    // Header
    React.createElement('div', { style:{ background:'#110D06', borderBottom:'1px solid #2A1E12', padding:'0 16px' } },
      React.createElement('div', { style:{ maxWidth:720, margin:'0 auto', display:'flex', alignItems:'center', height:54, gap:12 } },
        React.createElement('div', { style:{ fontSize:22, fontWeight:800 } }, 'TalentMA'),
        React.createElement('div', { style:{ fontSize:9, color:'#5A4A3A', letterSpacing:'1px' } }, 'PORTAIL CLIENT'),
        React.createElement('div', { style:{ marginLeft:'auto', fontSize:12, color:'#5A4A3A' } },
          React.createElement('b', { style:{ color:'#2ECC71' } }, profiles.filter(p=>p.disponible).length),
          ' disponibles'
        )
      )
    ),

    React.createElement('div', { style:{ maxWidth:720, margin:'0 auto', padding:16 } },

      // Hero
      React.createElement('div', { style:{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:14, padding:'18px 20px', marginBottom:16 } },
        React.createElement('div', { style:{ fontSize:18, fontWeight:800, marginBottom:4 } }, 'Trouvez votre talent certifie'),
        React.createElement('div', { style:{ fontSize:12, color:'#7A6A5A' } }, 'Freelances et consultants marocains certifies - France et Maroc')
      ),

      // Filters
      React.createElement('div', { style:{ background:'#110D06', borderRadius:12, padding:14, marginBottom:14 } },
        React.createElement('input', { style:{ ...inp, width:'100%', marginBottom:10 }, placeholder:'Rechercher...', value:search, onChange:e=>setSearch(e.target.value) }),
        React.createElement('div', { style:{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 } },
          React.createElement('select', { style:{ ...inp, flex:'1 1 110px', cursor:'pointer', appearance:'none' }, value:domain, onChange:e=>setDomain(e.target.value) },
            ['Tous','Dev','Design','Data','Marketing','Finance'].map(d => React.createElement('option', { key:d }, d))
          ),
          React.createElement('select', { style:{ ...inp, flex:'1 1 120px', cursor:'pointer', appearance:'none' }, value:contract, onChange:e=>setContract(e.target.value) },
            [['Tous','Tous contrats'],...contracts.map(c=>[c.id,c.label])].map(([v,l]) => React.createElement('option', { key:v, value:v }, l))
          )
        ),
        React.createElement('div', { style:{ display:'flex', gap:20 } },
          [['Disponibles',dispoOnly,setDispoOnly],['Certifies',certOnly,setCertOnly]].map(([label,val,setter]) =>
            React.createElement('label', { key:label, style:{ display:'flex', alignItems:'center', gap:7, cursor:'pointer', fontSize:12, color:'#7A6A5A', userSelect:'none' },
              onClick:()=>setter(!val)
            },
              React.createElement('div', { style:{ width:34, height:18, borderRadius:9, background:val?'#0F6E56':'#2A1E12', position:'relative', transition:'background .2s', flexShrink:0 } },
                React.createElement('div', { style:{ position:'absolute', top:2, left:val?17:2, width:14, height:14, borderRadius:'50%', background:'#fff', transition:'left .2s' } })
              ),
              label
            )
          )
        )
      ),

      React.createElement('div', { style:{ fontSize:12, color:'#5A4A3A', marginBottom:12 } },
        React.createElement('b', { style:{ color:'#C8553D' } }, filtered.length), ' talent'+(filtered.length>1?'s':'')
      ),

      // Cards
      React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:10 } },
        filtered.length === 0
          ? React.createElement('div', { style:{ textAlign:'center', padding:'50px 0', color:'#5A4A3A' } }, 'Aucun talent - modifiez les filtres')
          : filtered.map(p => {
              const c = ct(p.contractType)
              const isReq = requested.has(p.id)
              return React.createElement('div', { key:p.id,
                style:{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:12, padding:'14px 16px', cursor:'pointer' },
                onClick:()=>setSelected(p)
              },
                React.createElement('div', { style:{ display:'flex', gap:12, alignItems:'flex-start' } },
                  React.createElement('div', { style:{ width:44, height:44, borderRadius:10, background:c.color+'20', border:'1px solid '+c.color+'50', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:c.color, flexShrink:0 } },
                    (p.firstName||'?')[0]+(p.lastName||'?')[0]
                  ),
                  React.createElement('div', { style:{ flex:1, minWidth:0 } },
                    React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:3 } },
                      React.createElement('span', { style:{ fontWeight:700, fontSize:14 } }, p.firstName+' '+p.lastName),
                      p.screened && React.createElement('span', { style:{ display:'inline-flex', padding:'2px 8px', borderRadius:4, fontSize:10, background:'#0D3320', color:'#2ECC71', border:'1px solid #1A7A4340' } }, 'Certifie'),
                      React.createElement('span', { style:{ display:'inline-flex', padding:'2px 8px', borderRadius:4, fontSize:10, background:c.bg, color:c.color, border:'1px solid '+c.color+'40' } }, c.label)
                    ),
                    React.createElement('div', { style:{ fontSize:12, color:'#7A6A5A', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, p.headline),
                    React.createElement('div', { style:{ display:'flex', gap:10, fontSize:11, color:'#5A4A3A' } },
                      React.createElement('span', null, p.location),
                      React.createElement('span', { style:{ color:p.disponible?'#2ECC71':'#E74C3C' } }, p.disponible?'Disponible':'Occupe')
                    ),
                    (p.skills||[]).length > 0 && React.createElement('div', { style:{ display:'flex', gap:5, flexWrap:'wrap', marginTop:5 } },
                      (p.skills||[]).slice(0,4).map(s => React.createElement('span', { key:s, style:{ fontSize:10, padding:'2px 7px', borderRadius:4, background:'#1E1208', color:'#7A6A5A', border:'1px solid #2A1E12' } }, s))
                    )
                  ),
                  React.createElement('button', {
                    style:{ padding:'8px 12px', borderRadius:8, border:'1px solid '+(isReq?'#1A7A43':c.color), background:isReq?'#0D3320':'transparent', color:isReq?'#2ECC71':c.color, cursor:isReq?'default':'pointer', fontSize:11, fontWeight:700, fontFamily:"'Syne',sans-serif", flexShrink:0 },
                    onClick:e=>{ e.stopPropagation(); if(!isReq) handleRequest(p) }
                  }, isReq?'Demande':'Demander')
                )
              )
            })
      )
    ),

    // Detail modal
    selected && React.createElement('div', {
      style:{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', backdropFilter:'blur(4px)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 },
      onClick:()=>setSelected(null)
    },
      React.createElement('div', {
        style:{ background:'#1A1008', border:'1px solid #3A2A18', borderRadius:14, padding:22, width:'100%', maxWidth:500, maxHeight:'92vh', overflowY:'auto' },
        onClick:e=>e.stopPropagation()
      },
        React.createElement('div', { style:{ height:4, background:ct(selected.contractType).color, borderRadius:4, marginBottom:18 } }),
        React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', marginBottom:14 } },
          React.createElement('div', null,
            React.createElement('div', { style:{ fontWeight:800, fontSize:18 } }, selected.firstName+' '+selected.lastName),
            React.createElement('div', { style:{ fontSize:12, color:'#7A6A5A' } }, selected.headline)
          ),
          React.createElement('button', { style:{ background:'transparent', border:'1px solid #2A1E12', borderRadius:8, padding:'4px 10px', color:'#7A6A5A', cursor:'pointer', fontFamily:"'Syne',sans-serif" }, onClick:()=>setSelected(null) }, 'X')
        ),
        selected.screened && React.createElement('div', { style:{ background:'#0D3320', border:'1px solid #1A7A43', borderRadius:10, padding:12, marginBottom:14 } },
          React.createElement('div', { style:{ fontWeight:700, color:'#2ECC71', marginBottom:4 } }, 'Profil certifie'),
          React.createElement('div', { style:{ fontSize:12, color:'#D5BDAC' } }, selected.screeningNote)
        ),
        selected.education && React.createElement('div', { style:{ marginBottom:10 } },
          React.createElement('div', { style:{ fontSize:10, color:'#5A4A3A', marginBottom:4 } }, 'Formation'),
          React.createElement('div', { style:{ fontSize:12, color:'#D5BDAC', background:'#110D06', padding:'8px 10px', borderRadius:8 } }, selected.education)
        ),
        (selected.skills||[]).length > 0 && React.createElement('div', { style:{ marginBottom:14 } },
          React.createElement('div', { style:{ fontSize:10, color:'#5A4A3A', marginBottom:6 } }, 'Competences'),
          React.createElement('div', { style:{ display:'flex', flexWrap:'wrap', gap:6 } },
            (selected.skills||[]).map(s => React.createElement('span', { key:s, style:{ display:'inline-flex', padding:'3px 10px', borderRadius:4, fontSize:11, background:'#1E1208', color:'#D5BDAC', border:'1px solid #2A1E12' } }, s))
          )
        ),
        React.createElement('button', {
          style:{ width:'100%', padding:13, borderRadius:10, border:'1px solid '+(requested.has(selected.id)?'#1A7A43':'#C8553D'), background:requested.has(selected.id)?'#0D3320':'#C8553D20', color:requested.has(selected.id)?'#2ECC71':'#C8553D', cursor:requested.has(selected.id)?'default':'pointer', fontWeight:700, fontSize:14, fontFamily:"'Syne',sans-serif" },
          onClick:()=>{ if(!requested.has(selected.id)) handleRequest(selected) }
        }, requested.has(selected.id)?'Demande envoyee':'Demander la disponibilite')
      )
    )
  )
}
