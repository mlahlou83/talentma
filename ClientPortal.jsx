import { useState, useMemo, useEffect } from "react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0D0A06;color:#F0EDE8;font-family:'Syne',sans-serif}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#110D06}::-webkit-scrollbar-thumb{background:#3A2A18;border-radius:2px}
.btn{cursor:pointer;border:none;border-radius:8px;font-family:'Syne',sans-serif;font-weight:600;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
.btn-ghost{background:transparent;color:#7A6A5A;padding:7px 13px;font-size:12px;border:1px solid #2A1E12}.btn-ghost:hover{border-color:#C8553D;color:#C8553D}
.card{background:#1A1008;border:1px solid #2A1E12;border-radius:12px}
.input{background:#110D06;border:1px solid #2A1E12;border-radius:8px;padding:9px 13px;color:#F0EDE8;font-family:'Syne',sans-serif;font-size:13px;outline:none;width:100%}
.input:focus{border-color:#C8553D}
select.input{cursor:pointer;appearance:none}
.tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:4px;font-size:10px;font-family:'JetBrains Mono';font-weight:500}
.slide-in{animation:si .2s ease}@keyframes si{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}
.modal{background:#1A1008;border:1px solid #3A2A18;border-radius:14px;padding:22px;width:100%;max-width:500px;max-height:92vh;overflow-y:auto}
`;

const CONTRACTS = [
  { id:"freelance",  label:"Freelance",  color:"#0F6E56", bg:"#0A2018" },
  { id:"cdi_maroc",  label:"CDI Maroc",  color:"#BA7517", bg:"#1E1400" },
  { id:"cdi_france", label:"CDI France", color:"#185FA5", bg:"#0A1420" },
];

const PROFILES = [
  { id:1, firstName:"Karim",   lastName:"Ouazzani",  headline:"Dev Full Stack Freelance | React · Node.js", location:"Paris, France",    domain:"Dev",     skills:["React","Node.js","TypeScript","AWS"],    contractType:"freelance",  marche:"france", disponible:true,  screened:true,  screeningNote:"Profil technique excellent. React avancé confirmé. Communication fluide.", education:"Université Mohammed V Rabat · ISCAE" },
  { id:2, firstName:"Yasmine", lastName:"Benali",    headline:"UX Designer Indépendante | Figma · Branding", location:"Lyon, France",   domain:"Design",  skills:["Figma","Branding","Motion Design","UI/UX"],contractType:"freelance",  marche:"france", disponible:true,  screened:true,  screeningNote:"Portfolio solide. Maîtrise Figma confirmée. Recommandée.", education:"ISCAE Casablanca · École de Design Nantes" },
  { id:3, firstName:"Mehdi",   lastName:"Tazi",      headline:"Data Scientist · Consultant indépendant",    location:"Toulouse, France",domain:"Data",    skills:["Python","Machine Learning","SQL","NLP"],   contractType:"cdi_france", marche:"france", disponible:false, screened:true,  screeningNote:"Profil senior confirmé. Double culture franco-marocaine.", education:"HEC Paris" },
  { id:4, firstName:"Amine",   lastName:"Berrada",   headline:"Dev Mobile React Native · Freelancer",       location:"Casablanca",      domain:"Dev",     skills:["React Native","Flutter","TypeScript"],     contractType:"freelance",  marche:"maroc",  disponible:true,  screened:false, screeningNote:"", education:"EMI Rabat" },
  { id:5, firstName:"Rania",   lastName:"Kettani",   headline:"Data Analyst | Power BI · SQL",              location:"Rabat, Maroc",    domain:"Data",    skills:["Power BI","SQL","Excel","Tableau"],        contractType:"cdi_maroc",  marche:"maroc",  disponible:true,  screened:true,  screeningNote:"Profil analytique exceptionnel. Double culture confirmée.", education:"ISCAE Casablanca · ESSEC Paris" },
  { id:6, firstName:"Houda",   lastName:"Mansouri",  headline:"UX/UI Designer Freelance · Motion Design",   location:"Marrakech",       domain:"Design",  skills:["Figma","Adobe XD","Motion Design"],        contractType:"freelance",  marche:"maroc",  disponible:true,  screened:true,  screeningNote:"Créativité confirmée. Portfolio impressionnant.", education:"Université Hassan II · Gobelins Paris" },
  { id:7, firstName:"Omar",    lastName:"Ziani",     headline:"Growth Hacker · Consultant Marketing",       location:"Paris, France",   domain:"Marketing",skills:["SEO","Google Ads","Analytics","CRM"],     contractType:"cdi_france", marche:"france", disponible:true,  screened:false, screeningNote:"", education:"Al Akhawayn University · Lyon 3" },
  { id:8, firstName:"Salma",   lastName:"Idrissi",   headline:"Finance & Contrôle de gestion | CDI",        location:"Casablanca",      domain:"Finance", skills:["Excel","Contrôle de gestion","SAP","Audit"],contractType:"cdi_maroc",  marche:"maroc",  disponible:true,  screened:true,  screeningNote:"Rigueur et expertise comptable confirmées.", education:"ISCAE Casablanca" },
];

const ct = (id) => CONTRACTS.find(c => c.id === id) || CONTRACTS[0];

async function loadData(key) { try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; } }
async function saveData(key, val) { try { await window.storage.set(key, JSON.stringify(val)); } catch {} }

export default function ClientPortal() {
  const [search, setSearch]       = useState("");
  const [domain, setDomain]       = useState("Tous");
  const [contract, setContract]   = useState("Tous");
  const [marche, setMarche]       = useState("Tous");
  const [dispoOnly, setDispoOnly] = useState(false);
  const [certOnly, setCertOnly]   = useState(false);
  const [selected, setSelected]   = useState(null);
  const [requested, setRequested] = useState(new Set());

  useEffect(() => {
    loadData("client-requests").then(r => {
      if (r) setRequested(new Set(r.map(x => x.profileId)));
    });
  }, []);

  const filtered = useMemo(() => PROFILES.filter(p => {
    const q = search.toLowerCase();
    const ms = !q || `${p.firstName} ${p.lastName} ${p.headline} ${p.domain}`.toLowerCase().includes(q) || (p.skills||[]).some(s => s.toLowerCase().includes(q));
    return ms
      && (domain   === "Tous" || p.domain       === domain)
      && (contract === "Tous" || p.contractType === contract)
      && (marche   === "Tous" || p.marche       === marche)
      && (!dispoOnly || p.disponible)
      && (!certOnly  || p.screened);
  }), [search, domain, contract, marche, dispoOnly, certOnly]);

  const handleRequest = async (p) => {
    const next = new Set([...requested, p.id]);
    setRequested(next);
    const reqs = await loadData("client-requests") || [];
    await saveData("client-requests", [...reqs, { profileId: p.id, name:`${p.firstName} ${p.lastName}`, date: new Date().toISOString() }]);
  };

  const Toggle = ({ value, onChange, label }) => (
    <label style={{ display:"flex", alignItems:"center", gap:7, cursor:"pointer", fontSize:12, color:"#7A6A5A", userSelect:"none" }}>
      <div onClick={() => onChange(!value)}
        style={{ width:34, height:18, borderRadius:9, background:value?"#0F6E56":"#2A1E12", position:"relative", transition:"background .2s", flexShrink:0 }}>
        <div style={{ position:"absolute", top:2, left:value?17:2, width:14, height:14, borderRadius:"50%", background:"#fff", transition:"left .2s" }} />
      </div>
      {label}
    </label>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0D0A06" }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ background:"#110D06", borderBottom:"1px solid #2A1E12", padding:"0 16px", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:720, margin:"0 auto", display:"flex", alignItems:"center", height:54, gap:12 }}>
          <span style={{ fontSize:22 }}>🇲🇦</span>
          <div>
            <div style={{ fontSize:15, fontWeight:800 }}>TalentMA</div>
            <div style={{ fontSize:9, color:"#5A4A3A", fontFamily:"'JetBrains Mono'", letterSpacing:"1px" }}>PORTAIL CLIENT</div>
          </div>
          <div style={{ marginLeft:"auto", fontSize:12, color:"#5A4A3A" }}>
            <b style={{ color:"#2ECC71" }}>{PROFILES.filter(p=>p.disponible).length}</b> disponibles
          </div>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:16 }}>

        {/* Hero */}
        <div style={{ background:"linear-gradient(135deg,#0F6E5615,#185FA510)", border:"1px solid #2A1E12", borderRadius:14, padding:"18px 20px", marginBottom:16 }}>
          <div style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>Trouvez votre talent certifié</div>
          <div style={{ fontSize:12, color:"#7A6A5A" }}>Freelances et consultants marocains · Certifiés par screening indépendant · France &amp; Maroc</div>
        </div>

        {/* Filters */}
        <div style={{ background:"#110D06", borderRadius:12, padding:14, marginBottom:14 }}>
          <input className="input" placeholder="🔍 Nom, compétence, domaine…" value={search}
            onChange={e => setSearch(e.target.value)} style={{ marginBottom:10 }} />
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
            <select className="input" style={{ flex:"1 1 110px" }} value={domain} onChange={e => setDomain(e.target.value)}>
              <option value="Tous">Tous domaines</option>
              {["Dev","Design","Data","Marketing","Finance"].map(d => <option key={d}>{d}</option>)}
            </select>
            <select className="input" style={{ flex:"1 1 120px" }} value={contract} onChange={e => setContract(e.target.value)}>
              <option value="Tous">Tous contrats</option>
              {CONTRACTS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <select className="input" style={{ flex:"1 1 110px" }} value={marche} onChange={e => setMarche(e.target.value)}>
              <option value="Tous">🌍 Tous marchés</option>
              <option value="france">🇫🇷 France</option>
              <option value="maroc">🇲🇦 Maroc</option>
            </select>
          </div>
          <div style={{ display:"flex", gap:20 }}>
            <Toggle value={dispoOnly} onChange={setDispoOnly} label="Disponibles" />
            <Toggle value={certOnly}  onChange={setCertOnly}  label="Certifiés uniquement" />
          </div>
        </div>

        <div style={{ fontSize:12, color:"#5A4A3A", marginBottom:12 }}>
          <b style={{ color:"#C8553D" }}>{filtered.length}</b> talent{filtered.length>1?"s":""} trouvé{filtered.length>1?"s":""}
        </div>

        {/* Cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.length === 0
            ? <div style={{ textAlign:"center", padding:"50px 0", color:"#5A4A3A" }}><div style={{ fontSize:36, marginBottom:10 }}>🔍</div>Aucun talent — modifiez les filtres</div>
            : filtered.map(p => {
                const c = ct(p.contractType);
                const isReq = requested.has(p.id);
                return (
                  <div key={p.id} className="card slide-in" style={{ padding:"14px 16px", cursor:"pointer" }} onClick={() => setSelected(p)}>
                    <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                      <div style={{ width:44, height:44, borderRadius:10, background:`${c.color}20`, border:`1px solid ${c.color}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:c.color, flexShrink:0 }}>
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:3 }}>
                          <span style={{ fontWeight:700, fontSize:14 }}>{p.firstName} {p.lastName}</span>
                          {p.screened && <span className="tag" style={{ background:"#0D3320", color:"#2ECC71", border:"1px solid #1A7A4340" }}>✓ Certifié</span>}
                          <span className="tag" style={{ background:c.bg, color:c.color, border:`1px solid ${c.color}40` }}>{c.label}</span>
                          <span style={{ fontSize:11, color: p.disponible?"#2ECC71":"#E74C3C" }}>● {p.disponible?"Disponible":"Occupé"}</span>
                        </div>
                        <div style={{ fontSize:12, color:"#7A6A5A", marginBottom:5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.headline}</div>
                        <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:6 }}>📍 {p.location}</div>
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                          {(p.skills||[]).slice(0,4).map(s => <span key={s} className="tag" style={{ background:"#1E1208", color:"#7A6A5A", border:"1px solid #2A1E12" }}>{s}</span>)}
                        </div>
                      </div>
                      <button
                        style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${isReq?"#1A7A43":c.color}`, background:isReq?"#0D3320":"transparent", color:isReq?"#2ECC71":c.color, cursor:isReq?"default":"pointer", fontSize:11, fontWeight:700, fontFamily:"'Syne'", flexShrink:0, whiteSpace:"nowrap" }}
                        onClick={e => { e.stopPropagation(); if (!isReq) handleRequest(p); }}>
                        {isReq ? "✓ Demandé" : "Demander"}
                      </button>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal slide-in" onClick={e => e.stopPropagation()}>
            <div style={{ height:4, background:ct(selected.contractType).color, borderRadius:4, marginBottom:18 }} />
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:18 }}>{selected.firstName} {selected.lastName}</div>
                <div style={{ fontSize:12, color:"#7A6A5A", marginTop:2 }}>{selected.headline}</div>
              </div>
              <button className="btn btn-ghost" style={{ padding:"4px 10px" }} onClick={() => setSelected(null)}>✕</button>
            </div>

            {selected.screened && (
              <div style={{ background:"#0D3320", border:"1px solid #1A7A43", borderRadius:10, padding:12, marginBottom:14 }}>
                <div style={{ fontWeight:700, color:"#2ECC71", marginBottom:4 }}>✓ Profil certifié — Screening indépendant</div>
                <div style={{ fontSize:12, color:"#D5BDAC" }}>{selected.screeningNote}</div>
              </div>
            )}
            {!selected.screened && (
              <div style={{ background:"#1E1400", border:"1px solid #5C3D00", borderRadius:10, padding:12, marginBottom:14 }}>
                <div style={{ fontSize:12, color:"#F0B429" }}>⏳ Screening en cours de planification</div>
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
              {[["📍 Localisation",selected.location],["💼 Contrat",ct(selected.contractType).label],["🎯 Domaine",selected.domain],["⚡ Disponibilité",selected.disponible?"✅ Disponible":"❌ Occupé"]].map(([l,v]) => (
                <div key={l} style={{ background:"#110D06", borderRadius:8, padding:"8px 10px" }}>
                  <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:2 }}>{l}</div>
                  <div style={{ fontSize:12 }}>{v}</div>
                </div>
              ))}
            </div>

            {selected.education && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>📚 Formation</div>
                <div style={{ fontSize:12, color:"#D5BDAC", background:"#110D06", padding:"8px 10px", borderRadius:8 }}>{selected.education}</div>
              </div>
            )}

            {(selected.skills||[]).length > 0 && (
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:6 }}>🔧 Compétences</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {(selected.skills||[]).map(s => <span key={s} className="tag" style={{ background:"#1E1208", color:"#D5BDAC", border:"1px solid #2A1E12", fontSize:11, padding:"3px 10px" }}>{s}</span>)}
                </div>
              </div>
            )}

            <button
              style={{ width:"100%", padding:13, borderRadius:10, border:`1px solid ${requested.has(selected.id)?"#1A7A43":"#C8553D"}`, background:requested.has(selected.id)?"#0D3320":"#C8553D20", color:requested.has(selected.id)?"#2ECC71":"#C8553D", cursor:requested.has(selected.id)?"default":"pointer", fontWeight:700, fontSize:14, fontFamily:"'Syne'" }}
              onClick={() => { if (!requested.has(selected.id)) handleRequest(selected); }}>
              {requested.has(selected.id) ? "✓ Demande envoyée — nous vous recontactons" : "Demander la disponibilité"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
