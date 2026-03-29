import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { load } from '../storage'
import AdminNav from '../components/AdminNav'

const VISA_TYPES = {
  talent:  { label:'Passeport Talent', color:'#C8553D', desc:'Compétences & Expertise' },
  salarié: { label:'Visa Salarié',     color:'#185FA5', desc:'Offre CDI + salaire > 1,5x SMIC' },
  eu_blue: { label:'Carte Bleue EU',   color:'#7F77DD', desc:'Cadre hautement qualifié' },
}

const JALONS = [
  { id:'offre',        label:'Offre signée',             duree:'J0' },
  { id:'dossier',      label:'Dossier consulat',         duree:'J+7' },
  { id:'rdv_consulat', label:'Rendez-vous consulat',     duree:'J+21' },
  { id:'instruction',  label:'Instruction préfecture',   duree:'J+45' },
  { id:'visa_obtenu',  label:'Visa accordé',             duree:'J+60' },
  { id:'arrivée',      label:'Arrivée en France',        duree:'J+75' },
  { id:'ofii',         label:'Validation OFII',          duree:'J+90' },
  { id:'titre',        label:'Titre de séjour',          duree:'J+120' },
]

const DOSSIERS = [
  { id:1, talent:'Mehdi Tazi',    client:'Capgemini MA', visaType:'talent',  poste:'Data Scientist',     salaire:'65 000€', doneCount:2 },
  { id:2, talent:'Rania Kettani', client:'BNP Paribas',  visaType:'salarié', poste:'Contrôleur gestion', salaire:'48 000€', doneCount:0 },
  { id:3, talent:'Karim Ouazzani',client:'Acme Corp',    visaType:'talent',  poste:'Lead Dev React',     salaire:'72 000€', doneCount:5 },
]

export default function AdminImmigration() {
  const [session, setSession] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    load('session').then(s => { if (!s) navigate('/admin'); else setSession(s) })
  }, [])

  if (!session) return null

  return (
    <div style={{ minHeight:'100vh', background:'#0D0A06', fontFamily:"'Syne',sans-serif", color:'#F0EDE8' }}>
      <AdminNav session={session} />
      <div style={{ maxWidth:900, margin:'0 auto', padding:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
          {[['Dossiers',DOSSIERS.length,'#F0EDE8'],['En cours',DOSSIERS.filter(d=>d.doneCount>0&&d.doneCount<8).length,'#F0B429'],['Terminés',DOSSIERS.filter(d=>d.doneCount===8).length,'#2ECC71']].map(([l,v,c])=>(
            <div key={l} style={{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:12, padding:14, textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:800, color:c, fontFamily:"'JetBrains Mono'" }}>{v}</div>
              <div style={{ fontSize:10, color:'#5A4A3A', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {DOSSIERS.map(d => {
            const vc = VISA_TYPES[d.visaType]
            const pct = Math.round((d.doneCount/8)*100)
            return (
              <div key={d.id} style={{ background:'#1A1008', border:'1px solid #2A1E12', borderRadius:12, padding:'16px 18px', borderLeft:`3px solid ${vc.color}`, cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:15, marginBottom:2 }}>{d.talent}</div>
                    <div style={{ fontSize:12, color:'#7A6A5A' }}>{d.poste} · {d.client} · {d.salaire}/an</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:22, fontWeight:800, color:vc.color, fontFamily:"'JetBrains Mono'" }}>{pct}%</div>
                    <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:4, fontSize:10, fontFamily:"'JetBrains Mono'", background:`${vc.color}20`, color:vc.color, border:`1px solid ${vc.color}40` }}>{vc.label}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height:6, background:'#1E1208', borderRadius:3, marginBottom:10, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:vc.color, borderRadius:3, transition:'width .3s' }} />
                </div>

                {/* Jalons */}
                <div style={{ display:'flex', gap:3 }}>
                  {JALONS.map((j,i) => (
                    <div key={j.id} title={`${j.label} (${j.duree})`}
                      style={{ flex:1, height:4, borderRadius:2, background: i<d.doneCount ? vc.color : i===d.doneCount ? `${vc.color}40` : '#1E1208' }} />
                  ))}
                </div>
                <div style={{ fontSize:11, color:'#5A4A3A', marginTop:6 }}>
                  {d.doneCount < 8 ? `Prochaine étape : ${JALONS[d.doneCount]?.label}` : '✅ Procédure terminée'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
