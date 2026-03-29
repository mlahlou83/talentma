import { useState } from "react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0D0A06;color:#F0EDE8;font-family:'Syne',sans-serif}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#110D06}::-webkit-scrollbar-thumb{background:#3A2A18;border-radius:2px}
.btn{cursor:pointer;border:none;border-radius:8px;font-family:'Syne',sans-serif;font-weight:600;transition:all .15s;display:inline-flex;align-items:center;gap:6px;justify-content:center}
.btn-accent{background:#C8553D;color:#fff;padding:12px 24px;font-size:14px}.btn-accent:hover{background:#E06040}
.btn-accent:disabled{background:#2A1E12;color:#5A4A3A;cursor:not-allowed}
.btn-ghost{background:transparent;color:#7A6A5A;padding:10px 20px;font-size:13px;border:1px solid #2A1E12}.btn-ghost:hover{border-color:#C8553D;color:#C8553D}
.btn-teal{background:#0F6E56;color:#fff;padding:12px 24px;font-size:14px}.btn-teal:hover{background:#1A9070}
.input{background:#110D06;border:1px solid #2A1E12;border-radius:8px;padding:10px 14px;color:#F0EDE8;font-family:'Syne',sans-serif;font-size:13px;outline:none;width:100%;transition:border-color .15s}
.input:focus{border-color:#C8553D}
select.input{cursor:pointer;appearance:none}
.tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:4px;font-size:10px;font-family:'JetBrains Mono';font-weight:500}
.choice-card{border:2px solid #2A1E12;border-radius:12px;padding:16px;cursor:pointer;transition:all .15s;background:#110D06}
.choice-card:hover{border-color:#C8553D30}
.choice-card.selected{border-color:#C8553D;background:#C8553D0D}
.slide-in{animation:si .25s ease}@keyframes si{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.check{width:18px;height:18px;border-radius:5px;border:2px solid;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s}
`;

const PLANS = [
  { id:"starter",    label:"Starter",    price:"299 MAD/mois",  color:"#5BAFD6", features:["1 marché","Freelance uniquement","5 demandes/mois","Support email"] },
  { id:"business",   label:"Business",   price:"799 MAD/mois",  color:"#0F6E56", features:["2 marchés","Freelance + CDI Maroc","20 demandes/mois","Logo entreprise","Support prioritaire"] },
  { id:"enterprise", label:"Enterprise", price:"1 999 MAD/mois", color:"#C8553D", features:["Tous marchés","Tous types de contrat","Illimité","Logo + URL dédiée","Account manager dédié","API access"] },
];

const STEPS = [
  { id:"entreprise", label:"Entreprise",  icon:"🏢" },
  { id:"offre",      label:"Offre",       icon:"📦" },
  { id:"config",     label:"Config",      icon:"⚙️" },
  { id:"accès",      label:"Accès",       icon:"🔐" },
  { id:"recap",      label:"Confirmation",icon:"✅" },
];

const ALL_MARCHES   = ["maroc","france"];
const ALL_CONTRACTS = ["freelance","cdi_maroc","cdi_france"];
const ALL_DOMAINS   = ["Dev","Design","Data","Marketing","Finance","Autre"];
const MARCHE_LABELS   = { maroc:"🇲🇦 Maroc", france:"🇫🇷 France" };
const CONTRACT_LABELS = { freelance:"Freelance", cdi_maroc:"CDI Maroc", cdi_france:"CDI France" };

const PLAN_DEFAULTS = {
  starter:    { marches:["maroc"], contracts:["freelance"], domains:["Dev","Design"], quota:5,   logo:false, googleAuth:false, otp:false },
  business:   { marches:["maroc","france"], contracts:["freelance","cdi_maroc"], domains:["Dev","Design","Data","Marketing"], quota:20,  logo:true,  googleAuth:false, otp:false },
  enterprise: { marches:["maroc","france"], contracts:["freelance","cdi_maroc","cdi_france"], domains:["Dev","Design","Data","Marketing","Finance","Autre"], quota:999, logo:true,  googleAuth:true,  otp:true  },
};

function Checkbox({ checked, onChange, label, sublabel }) {
  return (
    <div onClick={()=>onChange(!checked)} style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", padding:"8px 0", userSelect:"none" }}>
      <div className="check" style={{ borderColor:checked?"#C8553D":"#3A2A18", background:checked?"#C8553D":"transparent", marginTop:1 }}>
        {checked && <span style={{ color:"#fff", fontSize:10, fontWeight:800 }}>✓</span>}
      </div>
      <div>
        <div style={{ fontSize:13, color:checked?"#F0EDE8":"#7A6A5A" }}>{label}</div>
        {sublabel && <div style={{ fontSize:11, color:"#5A4A3A", marginTop:1 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <div onClick={()=>onChange(!checked)} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"6px 0", userSelect:"none" }}>
      <div style={{ width:38, height:20, borderRadius:10, background:checked?"#0F6E56":"#2A1E12", position:"relative", transition:"background .2s", flexShrink:0 }}>
        <div style={{ position:"absolute", top:3, left:checked?20:3, width:14, height:14, borderRadius:"50%", background:"#fff", transition:"left .2s" }} />
      </div>
      <span style={{ fontSize:13, color:checked?"#F0EDE8":"#7A6A5A" }}>{label}</span>
    </div>
  );
}

export default function OnboardingClient() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    company:"", sector:"", website:"", size:"",
    contactName:"", contactEmail:"", contactPhone:"",
    planId:"business",
    marches:["maroc","france"], contracts:["freelance","cdi_maroc"], domains:["Dev","Design","Data","Marketing"], quota:20, logo:true,
    subdomain:"", adminEmail:"", adminPassword:"", confirmPassword:"",
    googleAuth:false, otp:false,
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const toggleArr = (k,v) => set(k, form[k].includes(v)?form[k].filter(x=>x!==v):[...form[k],v]);

  const applyPlan = (planId) => {
    const d = PLAN_DEFAULTS[planId];
    setForm(p=>({...p, planId, ...d}));
  };

  const canNext = () => {
    if(step===0) return form.company && form.contactName && form.contactEmail;
    if(step===1) return form.planId;
    if(step===2) return form.marches.length>0 && form.contracts.length>0 && form.domains.length>0;
    if(step===3) return form.subdomain && form.adminEmail && form.adminPassword && form.adminPassword===form.confirmPassword;
    return true;
  };

  const plan = PLANS.find(p=>p.id===form.planId) || PLANS[1];

  if(done) return (
    <div style={{ minHeight:"100vh", background:"#0D0A06", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <style>{css}</style>
      <div style={{ maxWidth:500, width:"100%", textAlign:"center" }} className="slide-in">
        <div style={{ fontSize:64, marginBottom:20 }}>🎉</div>
        <div style={{ fontSize:26, fontWeight:800, marginBottom:8 }}>Compte créé !</div>
        <div style={{ fontSize:13, color:"#7A6A5A", marginBottom:30, lineHeight:1.7 }}>
          Le portail de <b style={{ color:"#F0EDE8" }}>{form.company}</b> est prêt.<br/>
          URL d'accès : <b style={{ color:"#C8553D" }}>https://{form.subdomain}.talentma.ma</b>
        </div>
        <div style={{ background:"#1A1008", border:"1px solid #2A1E12", borderRadius:12, padding:20, marginBottom:24, textAlign:"left" }}>
          <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:12, fontWeight:700 }}>RÉCAPITULATIF</div>
          {[["Entreprise",form.company],["Offre",plan.label+" — "+plan.price],["URL",`${form.subdomain}.talentma.ma`],["Admin",form.adminEmail],["Marchés",form.marches.map(m=>MARCHE_LABELS[m]).join(" · ")],["Quota",form.quota===999?"Illimité":form.quota+" demandes/mois"]].map(([l,v])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #2A1E12", fontSize:12 }}>
              <span style={{ color:"#5A4A3A" }}>{l}</span>
              <span style={{ color:"#F0EDE8", fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={()=>{setDone(false);setStep(0);}}>Créer un autre compte</button>
          <button className="btn btn-teal" style={{ flex:1 }}>Envoyer les accès →</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0D0A06" }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ background:"#110D06", borderBottom:"1px solid #2A1E12", padding:"0 16px", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:680, margin:"0 auto", display:"flex", alignItems:"center", height:52, gap:12 }}>
          <span style={{ fontSize:22 }}>🇲🇦</span>
          <div><div style={{ fontSize:14, fontWeight:800 }}>TalentMA <span style={{ fontSize:10, color:"#C8553D" }}>Super Admin</span></div></div>
          <div style={{ marginLeft:"auto", fontSize:12, color:"#5A4A3A" }}>Onboarding nouveau client</div>
        </div>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px" }}>

        {/* Stepper */}
        <div style={{ display:"flex", alignItems:"center", marginBottom:28 }}>
          {STEPS.map((s,i)=>(
            <div key={s.id} style={{ display:"flex", alignItems:"center", flex:i<STEPS.length-1?1:"initial" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                <div style={{ width:36, height:36, borderRadius:10, background:i<step?"#C8553D":i===step?"#C8553D15":"#1E1208", border:`2px solid ${i<=step?"#C8553D":"#2A1E12"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:i<step?14:16, transition:"all .2s" }}>
                  {i<step?"✓":s.icon}
                </div>
                <div style={{ fontSize:9, color:i===step?"#C8553D":"#5A4A3A", marginTop:4, fontWeight:i===step?700:400, whiteSpace:"nowrap" }}>{s.label}</div>
              </div>
              {i<STEPS.length-1 && <div style={{ flex:1, height:2, background:i<step?"#C8553D30":"#2A1E12", margin:"0 6px", marginBottom:14 }} />}
            </div>
          ))}
        </div>

        {/* STEP 0 — Entreprise */}
        {step===0 && (
          <div className="slide-in">
            <div style={{ fontWeight:800, fontSize:22, marginBottom:4 }}>🏢 L'entreprise cliente</div>
            <div style={{ fontSize:13, color:"#7A6A5A", marginBottom:22 }}>Informations sur la société qui souscrit à TalentMA</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div><div style={{ fontSize:11, color:"#5A4A3A", marginBottom:5 }}>NOM DE LA SOCIÉTÉ *</div><input className="input" placeholder="Acme Corp" value={form.company} onChange={e=>set("company",e.target.value)} /></div>
              <div><div style={{ fontSize:11, color:"#5A4A3A", marginBottom:5 }}>SECTEUR</div>
                <select className="input" value={form.sector} onChange={e=>set("sector",e.target.value)}>
                  <option value="">Sélectionner…</option>
                  {["Tech / ESN","Finance / Banque","Industrie","Conseil","Commerce","Autre"].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div><div style={{ fontSize:11, color:"#5A4A3A", marginBottom:5 }}>SITE WEB</div><input className="input" placeholder="https://acmecorp.fr" value={form.website} onChange={e=>set("website",e.target.value)} /></div>
              <div><div style={{ fontSize:11, color:"#5A4A3A", marginBottom:5 }}>TAILLE</div>
                <select className="input" value={form.size} onChange={e=>set("size",e.target.value)}>
                  <option value="">Sélectionner…</option>
                  {["1-10","11-50","51-200","201-1000","1000+"].map(s=><option key={s}>{s} employés</option>)}
                </select>
              </div>
            </div>
            <div style={{ height:1, background:"#2A1E12", margin:"16px 0" }} />
            <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:12 }}>CONTACT PRINCIPAL</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div><div style={{ fontSize:11, color:"#5A4A3A", marginBottom:5 }}>NOM *</div><input className="input" placeholder="Marie Dupont" value={form.contactName} onChange={e=>set("contactName",e.target.value)} /></div>
              <div><div style={{ fontSize:11, color:"#5A4A3A", marginBottom:5 }}>EMAIL *</div><input className="input" type="email" placeholder="marie@acmecorp.fr" value={form.contactEmail} onChange={e=>set("contactEmail",e.target.value)} /></div>
            </div>
            <div><div style={{ fontSize:11, color:"#5A4A3A", marginBottom:5 }}>TÉLÉPHONE</div><input className="input" placeholder="+33 6…" value={form.contactPhone} onChange={e=>set("contactPhone",e.target.value)} /></div>
          </div>
        )}

        {/* STEP 1 — Offre */}
        {step===1 && (
          <div className="slide-in">
            <div style={{ fontWeight:800, fontSize:22, marginBottom:4 }}>📦 Choix de l'offre</div>
            <div style={{ fontSize:13, color:"#7A6A5A", marginBottom:22 }}>Sélectionnez l'offre souscrite par le client</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {PLANS.map(p=>(
                <div key={p.id} className={`choice-card ${form.planId===p.id?"selected":""}`} onClick={()=>applyPlan(p.id)}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${form.planId===p.id?p.color:"#3A2A18"}`, background:form.planId===p.id?p.color:"transparent", flexShrink:0 }} />
                      <div style={{ fontWeight:800, fontSize:16, color:form.planId===p.id?p.color:"#F0EDE8" }}>{p.label}</div>
                    </div>
                    <div style={{ fontFamily:"'JetBrains Mono'", fontSize:14, color:p.color, fontWeight:700 }}>{p.price}</div>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {p.features.map(f=><span key={f} className="tag" style={{ background:`${p.color}15`, color:p.color, border:`1px solid ${p.color}30` }}>✓ {f}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Config */}
        {step===2 && (
          <div className="slide-in">
            <div style={{ fontWeight:800, fontSize:22, marginBottom:4 }}>⚙️ Configuration du portail</div>
            <div style={{ fontSize:13, color:"#7A6A5A", marginBottom:22 }}>Pré-rempli selon l'offre <b style={{ color:plan.color }}>{plan.label}</b> — ajustez si besoin</div>

            <div style={{ background:"#110D06", borderRadius:12, padding:16, marginBottom:12 }}>
              <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:10 }}>🌍 MARCHÉS VISIBLES</div>
              {ALL_MARCHES.map(m=><Checkbox key={m} checked={form.marches.includes(m)} onChange={()=>toggleArr("marches",m)} label={MARCHE_LABELS[m]} />)}
            </div>

            <div style={{ background:"#110D06", borderRadius:12, padding:16, marginBottom:12 }}>
              <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:10 }}>📋 TYPES DE CONTRAT</div>
              {ALL_CONTRACTS.map(c=><Checkbox key={c} checked={form.contracts.includes(c)} onChange={()=>toggleArr("contracts",c)} label={CONTRACT_LABELS[c]} />)}
            </div>

            <div style={{ background:"#110D06", borderRadius:12, padding:16, marginBottom:12 }}>
              <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:10 }}>🗂️ DOMAINES ACCESSIBLES</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }}>
                {ALL_DOMAINS.map(d=><Checkbox key={d} checked={form.domains.includes(d)} onChange={()=>toggleArr("domains",d)} label={d} />)}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div style={{ background:"#110D06", borderRadius:12, padding:16 }}>
                <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:10 }}>📊 QUOTA MENSUEL</div>
                <input type="number" className="input" min={1} max={999} value={form.quota} onChange={e=>set("quota",Number(e.target.value))} style={{ marginBottom:4 }} />
                <div style={{ fontSize:10, color:"#3A2A18" }}>999 = illimité</div>
              </div>
              <div style={{ background:"#110D06", borderRadius:12, padding:16 }}>
                <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:10 }}>🔐 AUTH</div>
                <Toggle checked={form.otp} onChange={v=>set("otp",v)} label="OTP par email" />
                <Toggle checked={form.googleAuth} onChange={v=>set("googleAuth",v)} label="Google OAuth" />
                <Toggle checked={form.logo} onChange={v=>set("logo",v)} label="Logo entreprise" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Accès */}
        {step===3 && (
          <div className="slide-in">
            <div style={{ fontWeight:800, fontSize:22, marginBottom:4 }}>🔐 Accès et connexion</div>
            <div style={{ fontSize:13, color:"#7A6A5A", marginBottom:22 }}>Définissez l'URL et les identifiants du compte admin client</div>

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:6 }}>SOUS-DOMAINE *</div>
              <div style={{ display:"flex", alignItems:"center", gap:0 }}>
                <input className="input" style={{ borderRadius:"8px 0 0 8px", borderRight:"none" }}
                  placeholder="acme" value={form.subdomain}
                  onChange={e=>set("subdomain",e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))} />
                <span style={{ background:"#1A1008", border:"1px solid #2A1E12", borderLeft:"none", borderRadius:"0 8px 8px 0", padding:"10px 14px", fontSize:12, color:"#5A4A3A", whiteSpace:"nowrap" }}>
                  .talentma.ma
                </span>
              </div>
              {form.subdomain && <div style={{ fontSize:11, color:"#0F6E56", marginTop:4 }}>✓ https://{form.subdomain}.talentma.ma</div>}
            </div>

            <div style={{ height:1, background:"#2A1E12", margin:"16px 0" }} />
            <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:12 }}>COMPTE ADMINISTRATEUR CLIENT</div>

            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:5 }}>EMAIL ADMIN *</div>
              <input className="input" type="email" placeholder="admin@acmecorp.fr" value={form.adminEmail} onChange={e=>set("adminEmail",e.target.value)} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:4 }}>
              <div><div style={{ fontSize:11, color:"#5A4A3A", marginBottom:5 }}>MOT DE PASSE *</div><input className="input" type="password" placeholder="••••••••" value={form.adminPassword} onChange={e=>set("adminPassword",e.target.value)} /></div>
              <div><div style={{ fontSize:11, color:"#5A4A3A", marginBottom:5 }}>CONFIRMER *</div><input className="input" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e=>set("confirmPassword",e.target.value)} /></div>
            </div>
            {form.adminPassword && form.confirmPassword && form.adminPassword!==form.confirmPassword && (
              <div style={{ fontSize:12, color:"#E74C3C", marginBottom:8 }}>⚠️ Les mots de passe ne correspondent pas</div>
            )}
            {form.adminPassword && form.adminPassword===form.confirmPassword && form.adminPassword.length>=8 && (
              <div style={{ fontSize:12, color:"#2ECC71", marginBottom:8 }}>✓ Mot de passe valide</div>
            )}
          </div>
        )}

        {/* STEP 4 — Récap */}
        {step===4 && (
          <div className="slide-in">
            <div style={{ fontWeight:800, fontSize:22, marginBottom:4 }}>✅ Confirmation</div>
            <div style={{ fontSize:13, color:"#7A6A5A", marginBottom:22 }}>Vérifiez avant de créer le compte</div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { title:"🏢 Entreprise", items:[["Société",form.company],["Contact",`${form.contactName} · ${form.contactEmail}`],["Secteur",form.sector||"—"]] },
                { title:"📦 Offre", items:[["Plan",`${plan.label} — ${plan.price}`],["Quota",form.quota===999?"Illimité":form.quota+" demandes/mois"],["Logo",form.logo?"Activé":"Désactivé"]] },
                { title:"⚙️ Accès", items:[["Marchés",form.marches.map(m=>MARCHE_LABELS[m]).join(" · ")],["Contrats",form.contracts.map(c=>CONTRACT_LABELS[c]).join(" · ")],["Domaines",form.domains.join(", ")]] },
                { title:"🔐 Connexion", items:[["URL",`${form.subdomain}.talentma.ma`],["Admin",form.adminEmail],["OTP",form.otp?"Activé":"Désactivé"],["Google Auth",form.googleAuth?"Activé":"Désactivé"]] },
              ].map(section=>(
                <div key={section.title} style={{ background:"#110D06", borderRadius:12, padding:14 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#C8553D", marginBottom:10 }}>{section.title}</div>
                  {section.items.map(([l,v])=>(
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #2A1E12", fontSize:12 }}>
                      <span style={{ color:"#5A4A3A" }}>{l}</span>
                      <span style={{ color:"#F0EDE8", fontWeight:600, textAlign:"right", maxWidth:"60%" }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display:"flex", gap:12, marginTop:24 }}>
          {step>0 && <button className="btn btn-ghost" style={{ flex:1 }} onClick={()=>setStep(s=>s-1)}>← Retour</button>}
          {step<4
            ? <button className="btn btn-accent" style={{ flex:2 }} onClick={()=>setStep(s=>s+1)} disabled={!canNext()}>Continuer →</button>
            : <button className="btn btn-teal" style={{ flex:2 }} onClick={()=>setDone(true)}>✓ Créer le compte client</button>
          }
        </div>
      </div>
    </div>
  );
}
