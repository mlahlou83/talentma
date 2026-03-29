import { useState, useMemo } from "react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0D0A06;color:#F0EDE8;font-family:'Syne',sans-serif}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#110D06}::-webkit-scrollbar-thumb{background:#3A2A18;border-radius:2px}
.btn{cursor:pointer;border:none;border-radius:8px;font-family:'Syne',sans-serif;font-weight:600;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
.btn-accent{background:#C8553D;color:#fff;padding:8px 16px;font-size:12px}.btn-accent:hover{background:#E06040}
.btn-teal{background:#0F6E56;color:#fff;padding:8px 16px;font-size:12px}.btn-teal:hover{background:#1A9070}
.btn-ghost{background:transparent;color:#7A6A5A;padding:7px 13px;font-size:12px;border:1px solid #2A1E12}.btn-ghost:hover{border-color:#C8553D;color:#C8553D}
.btn-sm{padding:5px 10px!important;font-size:11px!important}
.card{background:#1A1008;border:1px solid #2A1E12;border-radius:12px}
.input{background:#110D06;border:1px solid #2A1E12;border-radius:8px;padding:9px 13px;color:#F0EDE8;font-family:'Syne',sans-serif;font-size:13px;outline:none;width:100%}
.input:focus{border-color:#C8553D}
textarea.input{resize:vertical;min-height:70px}
.tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:4px;font-size:10px;font-family:'JetBrains Mono';font-weight:500}
.nav-tab{padding:7px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;border:1px solid transparent;transition:all .15s;font-family:'Syne',sans-serif}
.nav-tab.active{background:#C8553D;color:#fff;border-color:#C8553D}
.nav-tab:not(.active){color:#7A6A5A;border-color:#2A1E12}.nav-tab:not(.active):hover{border-color:#C8553D;color:#C8553D}
.slide-in{animation:si .2s ease}@keyframes si{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}
.modal{background:#1A1008;border:1px solid #3A2A18;border-radius:14px;padding:22px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto}
`;

const REQUESTS = [
  { id:1, clientCompany:"Acme Corp", clientContact:"Marie Dupont", clientEmail:"marie@acmecorp.fr", talent:"Karim Ouazzani", talentDomain:"Dev", talentSkills:["React","Node.js","TypeScript"], talentContrat:"Freelance", talentDispo:true, status:"pending", priority:"high", message:"Besoin urgent d'un dev React pour une mission de 3 mois, démarrage le 1er avril.", adminNote:"", createdAt:"2026-03-28T09:15:00Z", updatedAt:"2026-03-28T09:15:00Z" },
  { id:2, clientCompany:"OCP Group", clientContact:"Ahmed Benali", clientEmail:"a.benali@ocp.ma", talent:"Rania Kettani", talentDomain:"Data", talentSkills:["Power BI","SQL","Excel"], talentContrat:"CDI Maroc", talentDispo:true, status:"contacted", priority:"medium", message:"Poste de Data Analyst, CDI à Casablanca. Profil très intéressant.", adminNote:"Entretien planifié le 2 avril à 14h. Ahmed confirmé.", createdAt:"2026-03-27T14:30:00Z", updatedAt:"2026-03-28T10:00:00Z" },
  { id:3, clientCompany:"Capgemini MA", clientContact:"Youssef Kettani", clientEmail:"y.kettani@capgemini.com", talent:"Mehdi Tazi", talentDomain:"Data", talentSkills:["Python","ML","SQL"], talentContrat:"CDI France", talentDispo:false, status:"pending", priority:"low", message:"Profil data scientist pour Paris. Visa talent nécessaire.", adminNote:"", createdAt:"2026-03-27T11:00:00Z", updatedAt:"2026-03-27T11:00:00Z" },
  { id:4, clientCompany:"Wafa Bank", clientContact:"Fatima Tazi", clientEmail:"f.tazi@wafabank.ma", talent:"Yasmine Benali", talentDomain:"Design", talentSkills:["Figma","Branding","UI/UX"], talentContrat:"Freelance", talentDispo:true, status:"closed_won", priority:"medium", message:"Refonte de l'application mobile Wafa. Mission 6 mois.", adminNote:"Mission signée ! TJM 650€/j. Démarrage 15 avril.", createdAt:"2026-03-25T08:00:00Z", updatedAt:"2026-03-28T16:00:00Z" },
  { id:5, clientCompany:"Acme Corp", clientContact:"Marie Dupont", clientEmail:"marie@acmecorp.fr", talent:"Amine Berrada", talentDomain:"Dev", talentSkills:["React Native","Flutter"], talentContrat:"Freelance", talentDispo:true, status:"closed_lost", priority:"low", message:"Dev mobile pour une app interne.", adminNote:"Client a trouvé en interne.", createdAt:"2026-03-20T10:00:00Z", updatedAt:"2026-03-26T09:00:00Z" },
  { id:6, clientCompany:"BNP Paribas", clientContact:"Sophie Martin", clientEmail:"s.martin@bnp.fr", talent:"Salma Idrissi", talentDomain:"Finance", talentSkills:["SAP","Contrôle de gestion","Excel"], talentContrat:"CDI France", talentDispo:true, status:"pending", priority:"high", message:"Poste CDI contrôleur de gestion Paris. Démarrage ASAP.", adminNote:"", createdAt:"2026-03-28T07:30:00Z", updatedAt:"2026-03-28T07:30:00Z" },
];

const STATUS_CONFIG = {
  pending:      { label:"En attente",    color:"#F0B429", bg:"#2D2000", icon:"⏳" },
  contacted:    { label:"Contacté",      color:"#5BAFD6", bg:"#0A1A28", icon:"📞" },
  closed_won:   { label:"Placé ✓",       color:"#2ECC71", bg:"#0D3320", icon:"✅" },
  closed_lost:  { label:"Non conclu",    color:"#E74C3C", bg:"#2D0D0D", icon:"❌" },
};
const PRIORITY_CONFIG = {
  high:   { label:"Urgent",  color:"#E74C3C", bg:"#2D0D0D" },
  medium: { label:"Normal",  color:"#F0B429", bg:"#2D2000" },
  low:    { label:"Bas",     color:"#5A4A3A", bg:"#1A1208" },
};

const fmtDate = d => new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit"});
const fmtTime = d => new Date(d).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});

function RequestModal({ req, onClose, onUpdate }) {
  const [status, setStatus] = useState(req.status);
  const [note, setNote] = useState(req.adminNote||"");
  const [priority, setPriority] = useState(req.priority);
  const sc = STATUS_CONFIG[status];
  const pc = PRIORITY_CONFIG[priority];

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal slide-in" onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:16 }}>Demande #{req.id}</div>
            <div style={{ fontSize:11, color:"#5A4A3A" }}>{fmtDate(req.createdAt)} à {fmtTime(req.createdAt)}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Parties */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <div style={{ background:"#110D06", borderRadius:10, padding:12 }}>
            <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:6, fontWeight:700 }}>CLIENT</div>
            <div style={{ fontWeight:700, fontSize:13 }}>{req.clientCompany}</div>
            <div style={{ fontSize:12, color:"#7A6A5A" }}>{req.clientContact}</div>
            <div style={{ fontSize:11, color:"#5BAFD6", marginTop:4 }}>{req.clientEmail}</div>
          </div>
          <div style={{ background:"#110D06", borderRadius:10, padding:12 }}>
            <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:6, fontWeight:700 }}>TALENT DEMANDÉ</div>
            <div style={{ fontWeight:700, fontSize:13 }}>{req.talent}</div>
            <div style={{ fontSize:12, color:"#7A6A5A" }}>{req.talentDomain} · {req.talentContrat}</div>
            <div style={{ fontSize:11, color:req.talentDispo?"#2ECC71":"#E74C3C", marginTop:4 }}>● {req.talentDispo?"Disponible":"Occupé"}</div>
          </div>
        </div>

        {/* Message client */}
        <div style={{ background:"#110D06", borderRadius:10, padding:12, marginBottom:14 }}>
          <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:6, fontWeight:700 }}>MESSAGE DU CLIENT</div>
          <div style={{ fontSize:13, color:"#D5BDAC", lineHeight:1.6 }}>{req.message}</div>
        </div>

        {/* Compétences */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:6 }}>COMPÉTENCES SOUHAITÉES</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {req.talentSkills.map(s=><span key={s} className="tag" style={{ background:"#1E1208", color:"#D5BDAC", border:"1px solid #2A1E12" }}>{s}</span>)}
          </div>
        </div>

        {/* Statut + Priorité */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          <div>
            <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:6 }}>STATUT</div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {Object.entries(STATUS_CONFIG).map(([k,v])=>(
                <button key={k} onClick={()=>setStatus(k)}
                  style={{ padding:"7px 10px", borderRadius:8, border:`2px solid ${status===k?v.color:"#2A1E12"}`, background:status===k?v.bg:"transparent", color:status===k?v.color:"#5A4A3A", cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"'Syne'", textAlign:"left" }}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:6 }}>PRIORITÉ</div>
            {Object.entries(PRIORITY_CONFIG).map(([k,v])=>(
              <button key={k} onClick={()=>setPriority(k)}
                style={{ display:"block", width:"100%", marginBottom:5, padding:"7px 10px", borderRadius:8, border:`2px solid ${priority===k?v.color:"#2A1E12"}`, background:priority===k?v.bg:"transparent", color:priority===k?v.color:"#5A4A3A", cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"'Syne'", textAlign:"left" }}>
                {v.label}
              </button>
            ))}
            {/* Actions rapides */}
            <div style={{ marginTop:10 }}>
              <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:6 }}>ACTIONS RAPIDES</div>
              <a href={`mailto:${req.clientEmail}?subject=TalentMA - ${req.talent}&body=Bonjour ${req.clientContact},%0A%0ASuite à votre demande concernant ${req.talent}...`}
                style={{ display:"block", padding:"7px 10px", borderRadius:8, background:"#1A1008", border:"1px solid #2A1E12", color:"#5BAFD6", fontSize:11, textDecoration:"none", marginBottom:5, textAlign:"center", fontFamily:"'Syne'", fontWeight:600 }}>
                ✉️ Email client
              </a>
            </div>
          </div>
        </div>

        {/* Note admin */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:6 }}>NOTE INTERNE</div>
          <textarea className="input" placeholder="Résumé des échanges, prochaine étape, date entretien…" value={note} onChange={e=>setNote(e.target.value)} />
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Annuler</button>
          <button className="btn btn-accent" style={{ flex:2 }} onClick={()=>onUpdate({...req,status,adminNote:note,priority,updatedAt:new Date().toISOString()})}>
            💾 Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DemandesClients() {
  const [requests, setRequests] = useState(REQUESTS);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(()=>requests.filter(r=>{
    const q=search.toLowerCase();
    const ms=!q||r.clientCompany.toLowerCase().includes(q)||r.talent.toLowerCase().includes(q)||r.talentDomain.toLowerCase().includes(q);
    const mf=filter==="all"||r.status===filter;
    return ms&&mf;
  }),[requests,filter,search]);

  const handleUpdate = (updated) => {
    setRequests(r=>r.map(x=>x.id===updated.id?updated:x));
    setSelected(null);
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r=>r.status==="pending").length,
    contacted: requests.filter(r=>r.status==="contacted").length,
    won: requests.filter(r=>r.status==="closed_won").length,
    lost: requests.filter(r=>r.status==="closed_lost").length,
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0D0A06" }}>
      <style>{css}</style>

      {/* NAV */}
      <div style={{ background:"#110D06", borderBottom:"1px solid #2A1E12", padding:"0 16px", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", alignItems:"center", height:52, gap:10 }}>
          <div style={{ marginRight:"auto" }}>
            <div style={{ fontSize:14, fontWeight:800 }}>🇲🇦 TalentMA <span style={{ fontSize:10, color:"#C8553D" }}>Demandes Clients</span></div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"16px" }}>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8, marginBottom:14 }}>
          {[["Total",stats.total,"#F0EDE8"],["En attente",stats.pending,"#F0B429"],["Contactés",stats.contacted,"#5BAFD6"],["Placés",stats.won,"#2ECC71"],["Non conclu",stats.lost,"#E74C3C"]].map(([l,v,c])=>(
            <div key={l} className="card" style={{ padding:"10px", textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:800, color:c, fontFamily:"'JetBrains Mono'" }}>{v}</div>
              <div style={{ fontSize:9, color:"#5A4A3A", marginTop:1 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
          <input style={{ flex:"1 1 200px", background:"#110D06", border:"1px solid #2A1E12", borderRadius:8, padding:"8px 13px", color:"#F0EDE8", fontFamily:"'Syne'", fontSize:12, outline:"none" }}
            placeholder="🔍 Rechercher client ou talent…" value={search} onChange={e=>setSearch(e.target.value)} />
          <div style={{ display:"flex", gap:6 }}>
            {[["all","Toutes"],["pending","En attente"],["contacted","Contacté"],["closed_won","Placés"],["closed_lost","Non conclu"]].map(([k,l])=>(
              <button key={k} className={`nav-tab ${filter===k?"active":""}`} onClick={()=>setFilter(k)}>{l}</button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.length===0
            ? <div style={{ textAlign:"center", padding:"50px 0", color:"#5A4A3A" }}><div style={{ fontSize:32, marginBottom:10 }}>📭</div>Aucune demande</div>
            : filtered.map(r=>{
                const sc = STATUS_CONFIG[r.status];
                const pc = PRIORITY_CONFIG[r.priority];
                return (
                  <div key={r.id} className="card slide-in" style={{ padding:"14px 16px", cursor:"pointer", borderLeft:`3px solid ${sc.color}` }} onClick={()=>setSelected(r)}>
                    <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:5 }}>
                          <span style={{ fontWeight:800, fontSize:13 }}>#{r.id}</span>
                          <span style={{ fontWeight:700, fontSize:13 }}>{r.clientCompany}</span>
                          <span style={{ fontSize:12, color:"#5A4A3A" }}>→</span>
                          <span style={{ fontWeight:600, fontSize:13, color:"#C8553D" }}>{r.talent}</span>
                          <span className="tag" style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.color}40` }}>{sc.icon} {sc.label}</span>
                          <span className="tag" style={{ background:pc.bg, color:pc.color, border:`1px solid ${pc.color}40` }}>{pc.label}</span>
                        </div>
                        <div style={{ fontSize:12, color:"#7A6A5A", marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {r.message}
                        </div>
                        <div style={{ display:"flex", gap:10, fontSize:11, color:"#5A4A3A", flexWrap:"wrap" }}>
                          <span>🎯 {r.talentDomain}</span>
                          <span>💼 {r.talentContrat}</span>
                          <span style={{ color:r.talentDispo?"#2ECC71":"#E74C3C" }}>● {r.talentDispo?"Disponible":"Occupé"}</span>
                          <span>📅 {fmtDate(r.createdAt)}</span>
                          {r.adminNote && <span style={{ color:"#7F77DD" }}>📝 Note interne</span>}
                        </div>
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:6 }}>
                          {r.talentSkills.map(s=><span key={s} className="tag" style={{ background:"#1E1208", color:"#7A6A5A", border:"1px solid #2A1E12" }}>{s}</span>)}
                        </div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
                        <button className="btn btn-accent btn-sm" onClick={e=>{e.stopPropagation();setSelected(r);}}>Traiter</button>
                        {r.status==="pending" && (
                          <button className="btn btn-teal btn-sm" onClick={e=>{e.stopPropagation();handleUpdate({...r,status:"contacted",updatedAt:new Date().toISOString()});}}>Marquer contacté</button>
                        )}
                      </div>
                    </div>
                    {r.adminNote && (
                      <div style={{ marginTop:8, fontSize:11, color:"#7F77DD", background:"#16123A", padding:"6px 10px", borderRadius:6, borderLeft:"2px solid #7F77DD" }}>
                        📝 {r.adminNote}
                      </div>
                    )}
                  </div>
                );
              })
          }
        </div>
      </div>

      {selected && <RequestModal req={selected} onClose={()=>setSelected(null)} onUpdate={handleUpdate} />}
    </div>
  );
}
