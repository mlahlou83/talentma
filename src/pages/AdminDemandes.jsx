import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { load } from '../storage'
import AdminNav from '../components/AdminNav'

export default function AdminDemandes() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)

  useEffect(() => {
    load('session').then(s => { if (!s) navigate('/admin'); else setSession(s) })
  }, [])

  if (!session) return React.createElement('div', { style:{ minHeight:'100vh', background:'#0D0A06', display:'flex', alignItems:'center', justifyContent:'center', color:'#5A4A3A' } }, 'Chargement...')

  return React.createElement('div', { style:{ minHeight:'100vh', background:'#0D0A06', fontFamily:"'Syne',sans-serif", color:'#F0EDE8' } },
    React.createElement(AdminNav, { session }),
    React.createElement('div', { style:{ maxWidth:900, margin:'0 auto', padding:20 } },
      React.createElement('div', { style:{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:14, padding:40, textAlign:'center' } },
        React.createElement('div', { style:{ fontSize:40, marginBottom:16 } }, 'TalentMA'),
        React.createElement('div', { style:{ fontSize:20, fontWeight:800, marginBottom:8 } }, 'AdminDemandes'),
        React.createElement('div', { style:{ fontSize:13, color:'#7A6A5A' } }, 'Page en cours de developpement. Bientot disponible.')
      )
    )
  )
}
