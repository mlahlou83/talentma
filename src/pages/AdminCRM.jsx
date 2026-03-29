import { useState, useEffect, useCallback, useMemo, useRef } from “react”;
import { useNavigate } from “react-router-dom”;
import { load, save } from “../storage”;
import { scoreProfile, DEFAULT_WEIGHTS, PIPELINE_STAGES_DEFAULT, CONTRACTS_DEFAULT, SKILLS_BY_DOMAIN, SAMPLE_PROFILES } from “../data”;
import AdminNav from “../components/AdminNav”;

const isOverdue = p => p.rappelDate && p.pipelineStage === “rappeler” && new Date(p.rappelDate) < new Date();
const fmtDate = d => d ? new Date(d).toLocaleDateString(“fr-FR”, { day:“2-digit”, month:“2-digit”, year:“2-digit” }) : “”;
const fmtDur = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

const buildCSV = (profiles) => {
const h = [“Prénom”,“Nom”,“Titre”,“Localisation”,“Contrat”,“Marché”,“Domaine”,“Score”,“Dispo”,“Certifié”,“Pipeline”,“Assigné”];
const r = profiles.map(p => [p.firstName,p.lastName,p.headline,p.location,p.contractType,p.marche,p.domain,p.score,p.disponible?“Oui”:“Non”,p.screened?“Oui”:“Non”,p.pipelineStage,p.assignedTo].map(v=>`"${(v||"").toString().replace(/"/g,'""')}"`).join(”,”));
return [h.join(”,”), …r].join(”\n”);
};

function ScoreBadge({ score, niveau }) {
const c = niveau?.includes(“Très”)?”#2ECC71”:niveau?.includes(“Probable”)?”#F0B429”:niveau?.includes(“Possible”)?”#E8963D”:”#E74C3C”;
const bg = niveau?.includes(“Très”)?”#0D3320”:niveau?.includes(“Probable”)?”#2D2000”:niveau?.includes(“Possible”)?”#2D1500”:”#2D0D0D”;
return <span style={{ display:“inline-flex”, padding:“2px 8px”, borderRadius:4, fontSize:10, fontFamily:“monospace”, background:bg, color:c, border:`1px solid ${c}40` }}>{score}pts</span>;
}

function StageBadge({ stage, stages }) {
const s = stages.find(s=>s.id===stage)||stages[0];
if (!s) return null;
return <span style={{ display:“inline-flex”, padding:“2px 8px”, borderRadius:4, fontSize:10, fontFamily:“monospace”, background:s.bg, color:s.color, border:`1px solid ${s.color}40` }}>{s.label}</span>;
}

function CallModal({ profile, currentUser, onClose, onSave }) {
const [phase, setPhase] = useState(“pre”);
const [seconds, setSeconds] = useState(0);
const [result, setResult] = useState(null);
const [notes, setNotes] = useState(””);
const [rappelDate, setRappelDate] = useState(profile.rappelDate||””);
const timer = useRef(null);
const startCall = () => { setPhase(“calling”); setSeconds(0); timer.current=setInterval(()=>setSeconds(s=>s+1),1000); if(profile.phone) window.open(`https://wa.me/${profile.phone.replace(/\D/g,"")}`, “_blank”); };
const endCall = () => { clearInterval(timer.current); setResult(seconds>=60?“qualifié”:seconds>=15?“rappeler”:“contacté”); setPhase(“post”); };
useEffect(()=>()=>clearInterval(timer.current),[]);
const handleSave = () => { const callEntry={id:Date.now(),date:new Date().toISOString(),duration:seconds,result,notes,user:currentUser}; onSave({callEntry,newStage:result||“contacté”,rappelDate}); };
const inputStyle = { background:”#110D06”, border:“1px solid #2A1E12”, borderRadius:8, padding:“9px 13px”, color:”#F0EDE8”, fontFamily:“inherit”, fontSize:13, outline:“none”, width:“100%” };
return (
<div style={{ position:“fixed”, inset:0, background:“rgba(0,0,0,.85)”, zIndex:100, display:“flex”, alignItems:“center”, justifyContent:“center”, padding:16 }} onClick={onClose}>
<div style={{ background:”#1A1008”, border:“1px solid #3A2A18”, borderRadius:14, padding:22, width:“100%”, maxWidth:380 }} onClick={e=>e.stopPropagation()}>
<div style={{ display:“flex”, justifyContent:“space-between”, marginBottom:16 }}>
<div><div style={{ fontWeight:800, fontSize:15 }}>{profile.firstName} {profile.lastName}</div><div style={{ fontSize:11, color:”#7A6A5A” }}>{profile.headline}</div></div>
<button style={{ …inputStyle, width:“auto”, padding:“4px 10px”, cursor:“pointer” }} onClick={onClose}>✕</button>
</div>
{phase===“pre” && <button style={{ width:“100%”, padding:13, background:”#25D366”, color:”#fff”, border:“none”, borderRadius:8, fontSize:14, fontWeight:700, cursor:profile.phone?“pointer”:“not-allowed”, opacity:profile.phone?1:0.4 }} onClick={startCall} disabled={!profile.phone}>📞 {profile.phone?“Lancer WhatsApp”:“Numéro manquant”}</button>}
{phase===“calling” && <div style={{ textAlign:“center” }}><div style={{ fontFamily:“monospace”, fontSize:42, color:”#25D366”, margin:“16px 0” }}>{fmtDur(seconds)}</div><button style={{ width:“100%”, padding:13, background:”#C8553D”, color:”#fff”, border:“none”, borderRadius:8, fontSize:14, fontWeight:700, cursor:“pointer” }} onClick={endCall}>Terminer</button></div>}
{phase===“post” && (
<div>
<div style={{ display:“flex”, gap:8, marginBottom:10 }}>
{[[“qualifié”,“✅ Qualifié”,”#2ECC71”],[“rappeler”,“🔄 Rappeler”,”#F0B429”],[“contacté”,“📞 Contacté”,”#7F77DD”]].map(([r,l,c])=>(
<button key={r} onClick={()=>setResult(r)} style={{ flex:1, padding:“8px 4px”, borderRadius:8, border:`2px solid ${result===r?c:"#2A1E12"}`, background:“transparent”, color:result===r?c:”#5A4A3A”, cursor:“pointer”, fontSize:10, fontWeight:700, fontFamily:“inherit” }}>{l}</button>
))}
</div>
{result===“rappeler” && <input type=“date” style={{ …inputStyle, marginBottom:10 }} value={rappelDate} onChange={e=>setRappelDate(e.target.value)} />}
<textarea style={{ …inputStyle, resize:“vertical”, minHeight:70, marginBottom:10 }} placeholder=“Résumé de l’appel…” value={notes} onChange={e=>setNotes(e.target.value)} />
<button style={{ width:“100%”, padding:12, background:”#C8553D”, color:”#fff”, border:“none”, borderRadius:8, fontSize:13, fontWeight:700, cursor:“pointer” }} onClick={handleSave}>💾 Enregistrer</button>
</div>
)}
</div>
</div>
);
}

export default function AdminCRM() {
const navigate = useNavigate();
const [session, setSession] = useState(null);
const [profiles, setProfiles] = useState([]);
const [stages] = useState(PIPELINE_STAGES_DEFAULT);
const [contracts] = useState(CONTRACTS_DEFAULT);
const [users] = useState([“Mohamed”,“Collègue”]);
const [view, setView] = useState(“list”);
const [search, setSearch] = useState(””);
const [filterDomain, setFilterDomain] = useState(“Tous”);
const [filterContract, setFilterContract] = useState(“Tous”);
const [filterMarche, setFilterMarche] = useState(“Tous”);
const [filterStage, setFilterStage] = useState(“Tous”);
const [filterOverdue, setFilterOverdue] = useState(false);
const [callModal, setCallModal] = useState(null);
const [showCSV, setShowCSV] = useState(false);
const [csvCopied, setCsvCopied] = useState(false);

useEffect(() => {
load(“session”).then(s => { if (!s) { navigate(”/admin”); return; } setSession(s); });
load(“tm-profiles”).then(p => {
if (p?.length) setProfiles(p.map(x => scoreProfile(x, DEFAULT_WEIGHTS)));
else { const sc = SAMPLE_PROFILES.map(x => scoreProfile(x, DEFAULT_WEIGHTS)); setProfiles(sc); save(“tm-profiles”, sc); }
});
}, []);

const persist = useCallback(async p => { setProfiles(p); await save(“tm-profiles”, p); }, []);
const overdueCount = useMemo(() => profiles.filter(isOverdue).length, [profiles]);

const filtered = useMemo(() => profiles.filter(p => {
const q = search.toLowerCase();
return (!q || `${p.firstName} ${p.lastName} ${p.headline}`.toLowerCase().includes(q))
&& (filterDomain === “Tous” || p.domain === filterDomain)
&& (filterContract === “Tous” || p.contractType === filterContract)
&& (filterMarche === “Tous” || p.marche === filterMarche)
&& (filterStage === “Tous” || p.pipelineStage === filterStage)
&& (!filterOverdue || isOverdue(p));
}).sort((a,b) => (b.scoreOverride??b.score) - (a.scoreOverride??a.score)), [profiles, search, filterDomain, filterContract, filterMarche, filterStage, filterOverdue]);

const stats = useMemo(() => ({
total: profiles.length, dispo: profiles.filter(p=>p.disponible).length,
certified: profiles.filter(p=>p.screened).length, overdue: overdueCount,
placé: profiles.filter(p=>p.pipelineStage===“placé”).length,
stageBreak: stages.map(s => ({ …s, count: profiles.filter(p=>p.pipelineStage===s.id).length })),
}), [profiles, overdueCount, stages]);

const handleCallSave = async ({ callEntry, newStage, rappelDate }) => {
await persist(profiles.map(p => p.id===callModal.id ? { …p, pipelineStage:newStage, rappelDate, callHistory:[callEntry,…(p.callHistory||[])] } : p));
setCallModal(null);
};

const inputStyle = { background:”#110D06”, border:“1px solid #2A1E12”, borderRadius:8, padding:“9px 13px”, color:”#F0EDE8”, fontFamily:“inherit”, fontSize:13, outline:“none”, appearance:“none”, cursor:“pointer” };

if (!session) return <div style={{ minHeight:“100vh”, background:”#0D0A06”, display:“flex”, alignItems:“center”, justifyContent:“center”, color:”#5A4A3A” }}>Chargement…</div>;

const DOMAINS = [“Tous”,“Dev”,“Design”,“Data”,“Marketing”,“Finance”,“Autre”];

return (
<div style={{ minHeight:“100vh”, background:”#0D0A06”, fontFamily:”‘Syne’,sans-serif”, color:”#F0EDE8” }}>
<AdminNav session={session} />
<div style={{ maxWidth:900, margin:“0 auto”, padding:“14px 16px” }}>

```
    {/* Stats */}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8, marginBottom:12 }}>
      {[["Total",stats.total,"#F0EDE8"],["Dispos",stats.dispo,"#2ECC71"],["Certifiés",stats.certified,"#F0B429"],["Placés",stats.placé,"#C8553D"],["⚠️",stats.overdue,"#E74C3C"]].map(([l,v,c])=>(
        <div key={l} style={{ background:"#1A1008", border:"1px solid #2A1E12", borderRadius:12, padding:"8px", textAlign:"center" }}>
          <div style={{ fontSize:18, fontWeight:800, color:c, fontFamily:"monospace" }}>{v}</div>
          <div style={{ fontSize:9, color:"#5A4A3A" }}>{l}</div>
        </div>
      ))}
    </div>

    {/* Pipeline bar */}
    <div style={{ display:"flex", gap:4, marginBottom:12 }}>
      {stats.stageBreak.map(s => (
        <div key={s.id} onClick={()=>setFilterStage(filterStage===s.id?"Tous":s.id)} title={s.label}
          style={{ flex:s.count||0.3, height:20, background:filterStage===s.id?s.color:s.bg, border:`1px solid ${s.color}40`, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", minWidth:24 }}>
          <span style={{ fontSize:9, color:filterStage===s.id?"#fff":s.color, fontWeight:700, fontFamily:"monospace" }}>{s.count}</span>
        </div>
      ))}
    </div>

    {/* Filters */}
    <div style={{ background:"#110D06", borderRadius:12, padding:12, marginBottom:12 }}>
      <input style={{ ...inputStyle, width:"100%", marginBottom:8 }} placeholder="🔍 Nom, titre, ville…" value={search} onChange={e=>setSearch(e.target.value)} />
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <select style={{ ...inputStyle, flex:"1 1 90px" }} value={filterDomain} onChange={e=>setFilterDomain(e.target.value)}>
          {DOMAINS.map(d => <option key={d}>{d}</option>)}
        </select>
        <select style={{ ...inputStyle, flex:"1 1 100px" }} value={filterContract} onChange={e=>setFilterContract(e.target.value)}>
          <option value="Tous">Tous contrats</option>
          {contracts.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select style={{ ...inputStyle, flex:"1 1 90px" }} value={filterMarche} onChange={e=>setFilterMarche(e.target.value)}>
          <option value="Tous">🌍 Tous</option>
          <option value="france">🇫🇷 France</option>
          <option value="maroc">🇲🇦 Maroc</option>
        </select>
      </div>
    </div>

    {/* Toolbar */}
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
      <div style={{ display:"flex", gap:6 }}>
        {[["list","☰ Liste"],["kanban","⬜ Kanban"]].map(([v,l]) => (
          <button key={v} onClick={()=>setView(v)} style={{ padding:"7px 12px", borderRadius:8, border:`1px solid ${view===v?"#C8553D":"#2A1E12"}`, background:view===v?"#C8553D":"transparent", color:view===v?"#fff":"#7A6A5A", cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit" }}>{l}</button>
        ))}
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <span style={{ fontSize:12, color:"#5A4A3A" }}><b style={{ color:"#C8553D" }}>{filtered.length}</b> profil{filtered.length>1?"s":""}</span>
        <button onClick={()=>{setShowCSV(true);setCsvCopied(false);}} style={{ background:"transparent", border:"1px solid #2A1E12", borderRadius:8, padding:"6px 12px", color:"#7A6A5A", cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>↓ CSV</button>
        <button onClick={()=>setFilterOverdue(!filterOverdue)} style={{ background:"transparent", border:`1px solid ${filterOverdue?"#E74C3C":"#2A1E12"}`, borderRadius:8, padding:"6px 12px", color:filterOverdue?"#E74C3C":"#7A6A5A", cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>
          🔔{overdueCount>0&&<span style={{ color:"#E74C3C", fontWeight:800, marginLeft:3 }}>{overdueCount}</span>}
        </button>
      </div>
    </div>

    {/* LIST */}
    {view==="list" && (
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.length===0
          ? <div style={{ textAlign:"center", padding:"50px 0", color:"#5A4A3A" }}>🔍 Aucun profil</div>
          : filtered.map((p,i) => {
              const c = contracts.find(c=>c.id===p.contractType)||{label:"—",color:"#888",bg:"#222"};
              const stage = stages.find(s=>s.id===p.pipelineStage)||stages[0];
              return (
                <div key={p.id} style={{ background:"#1A1008", border:"1px solid #2A1E12", borderRadius:12, padding:"13px 15px", borderLeft:`3px solid ${isOverdue(p)?"#E74C3C":stage?.color||"#2A1E12"}`, cursor:"pointer" }}>
                  <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:`${c.color}20`, border:`1px solid ${c.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:c.color, flexShrink:0 }}>{p.firstName?.[0]}{p.lastName?.[0]}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:3 }}>
                        <span style={{ fontWeight:700, fontSize:13 }}>{p.firstName} {p.lastName}</span>
                        <ScoreBadge score={p.scoreOverride??p.score} niveau={p.niveau} />
                        <StageBadge stage={p.pipelineStage} stages={stages} />
                      </div>
                      <div style={{ fontSize:11, color:"#7A6A5A", marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.headline}</div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", fontSize:10, color:"#5A4A3A" }}>
                        <span>📍 {p.location}</span>
                        <span style={{ display:"inline-flex", padding:"2px 8px", borderRadius:4, fontFamily:"monospace", background:c.bg, color:c.color, border:`1px solid ${c.color}40` }}>{c.label}</span>
                        {p.screened&&<span style={{ color:"#2ECC71" }}>✓ Certifié</span>}
                        {p.rappelDate&&<span style={{ color:isOverdue(p)?"#E74C3C":"#F0B429" }}>📅 {fmtDate(p.rappelDate)}</span>}
                        <span>👤 {p.assignedTo}</span>
                      </div>
                      {(p.skills||[]).length>0&&(
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:5 }}>
                          {(p.skills||[]).slice(0,5).map(s=><span key={s} style={{ fontSize:10, padding:"2px 7px", borderRadius:4, fontFamily:"monospace", background:"#1E1208", color:"#7A6A5A", border:"1px solid #2A1E12" }}>{s}</span>)}
                        </div>
                      )}
                    </div>
                    <button onClick={e=>{e.stopPropagation();setCallModal(p);}} style={{ background:"#25D366", color:"#fff", border:"none", borderRadius:8, padding:"7px 11px", fontSize:11, cursor:"pointer", flexShrink:0 }}>📞</button>
                  </div>
                </div>
              );
            })
        }
      </div>
    )}

    {/* KANBAN */}
    {view==="kanban" && (
      <div style={{ overflowX:"auto" }}>
        <div style={{ display:"flex", gap:12, minWidth:"max-content" }}>
          {stages.map(stage => {
            const sp = filtered.filter(p=>p.pipelineStage===stage.id);
            return (
              <div key={stage.id} style={{ flex:"0 0 180px", background:"#110D06", borderRadius:12, padding:10, border:"1px solid #2A1E12" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:stage.color }}>{stage.label}</span>
                  <span style={{ fontSize:10, fontFamily:"monospace", background:stage.bg, color:stage.color, padding:"2px 7px", borderRadius:10 }}>{sp.length}</span>
                </div>
                {sp.map(p=>(
                  <div key={p.id} style={{ background:"#1A1008", border:"1px solid #2A1E12", borderRadius:8, padding:10, marginBottom:8, cursor:"pointer" }} onClick={()=>setCallModal(p)}>
                    <div style={{ fontWeight:700, fontSize:12, marginBottom:3 }}>{p.firstName} {p.lastName}</div>
                    <div style={{ fontSize:10, color:"#7A6A5A", marginBottom:5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.headline}</div>
                    <ScoreBadge score={p.scoreOverride??p.score} niveau={p.niveau} />
                  </div>
                ))}
                {sp.length===0&&<div style={{ fontSize:11, color:"#3A2A18", textAlign:"center", padding:"16px 0" }}>—</div>}
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>

  {/* CSV Modal */}
  {showCSV&&(
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={()=>setShowCSV(false)}>
      <div style={{ background:"#1A1008", border:"1px solid #3A2A18", borderRadius:14, padding:22, width:"100%", maxWidth:500 }} onClick={e=>e.stopPropagation()}>
        <div style={{ fontWeight:800, fontSize:15, marginBottom:6 }}>Export CSV — {filtered.length} profils</div>
        <textarea readOnly value={buildCSV(filtered)} style={{ width:"100%", height:160, background:"#110D06", border:"1px solid #2A1E12", borderRadius:8, padding:"10px 12px", color:"#D5BDAC", fontFamily:"monospace", fontSize:10, resize:"none", outline:"none", marginBottom:10 }} onFocus={e=>e.target.select()} />
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ flex:1, padding:10, background:"transparent", border:"1px solid #2A1E12", borderRadius:8, color:"#7A6A5A", cursor:"pointer", fontFamily:"inherit" }} onClick={()=>setShowCSV(false)}>Fermer</button>
          <button style={{ flex:2, padding:10, background:csvCopied?"#0D3320":"#C8553D", color:csvCopied?"#2ECC71":"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}
            onClick={()=>navigator.clipboard.writeText(buildCSV(filtered)).then(()=>{setCsvCopied(true);setTimeout(()=>setCsvCopied(false),2500);})}>
            {csvCopied?"✓ Copié !":"📋 Copier tout"}
          </button>
        </div>
      </div>
    </div>
  )}

  {callModal&&<CallModal profile={callModal} currentUser={session.username} onClose={()=>setCallModal(null)} onSave={handleCallSave} />}
</div>
```

);
}
