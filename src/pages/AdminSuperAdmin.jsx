import { useState, useEffect, useMemo } from "react";

// ─── STORAGE ──────────────────────────────────────────────────────────────
async function load(key) { try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; } }
async function save(key, val) { try { await window.storage.set(key, JSON.stringify(val)); } catch {} }

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────
const DEFAULT_PLANS = [
  { id:"starter",    label:"Starter",    color:"#5BAFD6", price:299,  currency:"MAD", features:{ marches:["maroc"], contracts:["freelance"], domains:["Dev","Design"], quota:5,  logo:false, hiddenProfiles:[] } },
  { id:"business",   label:"Business",   color:"#0F6E56", price:799,  currency:"MAD", features:{ marches:["maroc","france"], contracts:["freelance","cdi_maroc"], domains:["Dev","Design","Data","Marketing"], quota:20, logo:true,  hiddenProfiles:[] } },
  { id:"enterprise", label:"Enterprise", color:"#C8553D", price:1999, currency:"MAD", features:{ marches:["maroc","france"], contracts:["freelance","cdi_maroc","cdi_france"], domains:["Dev","Design","Data","Marketing","Finance","Autre"], quota:999, logo:true,  hiddenProfiles:[] } },
];

const DEFAULT_USERS = [
  { id:1, username:"Mohamed",  email:"mohamed@talentma.ma",  password:"talentma2026", role:"superadmin", status:"active",  createdAt:"2026-01-01", lastLogin:"2026-03-28", planId:null, company:null, subdomain:null, logoUrl:null, customConfig:{} },
  { id:2, username:"Collègue", email:"collab@talentma.ma",   password:"talent123",    role:"admin",      status:"active",  createdAt:"2026-01-15", lastLogin:"2026-03-27", planId:null, company:null, subdomain:null, logoUrl:null, customConfig:{} },
  { id:3, username:"Acme Corp",email:"rh@acmecorp.fr",       password:"acme2026",     role:"client",     status:"active",  createdAt:"2026-02-01", lastLogin:"2026-03-25", planId:"business",   company:"Acme Corp",      subdomain:"acme",    logoUrl:null, customConfig:{ marches:["france"], contracts:["freelance","cdi_france"], domains:["Dev","Data"], quota:20, hiddenProfiles:[] } },
  { id:4, username:"OCP Group", email:"talent@ocp.ma",       password:"ocp2026",      role:"client",     status:"active",  createdAt:"2026-02-10", lastLogin:"2026-03-20", planId:"enterprise", company:"OCP Group",      subdomain:"ocp",     logoUrl:null, customConfig:{ marches:["maroc","france"], contracts:["freelance","cdi_maroc","cdi_france"], domains:["Dev","Design","Data","Marketing","Finance","Autre"], quota:999, hiddenProfiles:[] } },
  { id:5, username:"StartupXYZ",email:"cto@startupxyz.ma",   password:"startup2026",  role:"client",     status:"suspended",createdAt:"2026-03-01", lastLogin:"2026-03-10", planId:"starter",    company:"StartupXYZ",     subdomain:"startupxyz",logoUrl:null, customConfig:{ marches:["maroc"], contracts:["freelance"], domains:["Dev"], quota:5, hiddenProfiles:[] } },
  { id:6, username:"Wafa Bank", email:"rh@wafabank.ma",       password:"wafa2026",     role:"client",     status:"pending", createdAt:"2026-03-25", lastLogin:null,          planId:"business",   company:"Wafa Bank",      subdomain:"wafa",    logoUrl:null, customConfig:{ marches:["maroc"], contracts:["cdi_maroc"], domains:["Finance","Data"], quota:20, hiddenProfiles:[] } },
];

const ALL_MARCHES   = ["maroc","france"];
const ALL_CONTRACTS = ["freelance","cdi_maroc","cdi_france"];
const ALL_DOMAINS   = ["Dev","Design","Data","Marketing","Finance","Autre"];
const CONTRACT_LABELS = { freelance:"Freelance", cdi_maroc:"CDI Maroc", cdi_france:"CDI France" };
const MARCHE_LABELS   = { maroc:"🇲🇦 Maroc", france:"🇫🇷 France" };
const ROLE_CONFIG = {
  superadmin: { label:"Super Admin", color:"#C8553D", bg:"#2D1000" },
  admin:      { label:"Admin",       color:"#F0B429", bg:"#2D2000" },
  collaborateur:{ label:"Collaborateur", color:"#7F77DD", bg:"#16123A" },
  client:     { label:"Client",      color:"#0F6E56", bg:"#0A2018" },
};
const STATUS_CONFIG = {
  active:    { label:"Actif",    color:"#2ECC71", bg:"#0D3320" },
  suspended: { label:"Suspendu", color:"#E74C3C", bg:"#2D0D0D" },
  pending:   { label:"En attente",color:"#F0B429", bg:"#2D2000" },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0D0A06;color:#F0EDE8;font-family:'Syne',sans-serif}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#110D06}::-webkit-scrollbar-thumb{background:#3A2A18;border-radius:2px}
.btn{cursor:pointer;border:none;border-radius:8px;font-family:'Syne',sans-serif;font-weight:600;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
.btn-accent{background:#C8553D;color:#fff;padding:9px 18px;font-size:13px}.btn-accent:hover{background:#E06040}
.btn-teal{background:#0F6E56;color:#fff;padding:9px 18px;font-size:13px}.btn-teal:hover{background:#1A9070}
.btn-ghost{background:transparent;color:#7A6A5A;padding:7px 13px;font-size:12px;border:1px solid #2A1E12}.btn-ghost:hover{border-color:#C8553D;color:#C8553D}
.btn-sm{padding:5px 10px!important;font-size:11px!important}
.btn-danger{background:transparent;color:#E74C3C;padding:7px 13px;font-size:12px;border:1px solid #7A1E17}.btn-danger:hover{background:#2D0D0D}
.card{background:#1A1008;border:1px solid #2A1E12;border-radius:12px}
.input{background:#110D06;border:1px solid #2A1E12;border-radius:8px;padding:9px 13px;color:#F0EDE8;font-family:'Syne',sans-serif;font-size:13px;outline:none;width:100%}
.input:focus{border-color:#C8553D}
select.input{cursor:pointer;appearance:none}
textarea.input{resize:vertical;min-height:60px}
.tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:4px;font-size:10px;font-family:'JetBrains Mono';font-weight:500}
.slide-in{animation:si .2s ease}@keyframes si{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:flex-start;justify-content:center;padding:16px;overflow-y:auto}
.modal{background:#1A1008;border:1px solid #3A2A18;border-radius:14px;padding:24px;width:100%;max-width:560px;margin:auto}
.nav-tab{padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;border:1px solid transparent;transition:all .15s;white-space:nowrap;font-family:'Syne',sans-serif}
.nav-tab.active{background:#C8553D;color:#fff;border-color:#C8553D}
.nav-tab:not(.active){color:#7A6A5A;border-color:#2A1E12}.nav-tab:not(.active):hover{border-color:#C8553D;color:#C8553D}
.row{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid #2A1E12;font-size:13px}
.row:last-child{border-bottom:none}
.section-title{font-size:11px;color:#5A4A3A;font-weight:700;letter-spacing:.8px;margin-bottom:10px;margin-top:18px}
.check-row{display:flex;align-items:center;gap:10px;padding:8px 0;cursor:pointer;user-select:none;font-size:13px}
`;

// ─── COMPONENTS ───────────────────────────────────────────────────────────
function Badge({ role }) {
  const c = ROLE_CONFIG[role] || ROLE_CONFIG.client;
  return <span className="tag" style={{ background:c.bg, color:c.color, border:`1px solid ${c.color}40` }}>{c.label}</span>;
}
function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return <span className="tag" style={{ background:c.bg, color:c.color, border:`1px solid ${c.color}40` }}>● {c.label}</span>;
}
function PlanBadge({ planId, plans }) {
  if (!planId) return <span style={{ fontSize:11, color:"#3A2A18" }}>—</span>;
  const p = plans.find(p=>p.id===planId);
  if (!p) return null;
  return <span className="tag" style={{ background:`${p.color}20`, color:p.color, border:`1px solid ${p.color}40` }}>{p.label}</span>;
}
function Checkbox({ checked, onChange, label }) {
  return (
    <div className="check-row" onClick={() => onChange(!checked)}>
      <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${checked?"#C8553D":"#3A2A18"}`, background:checked?"#C8553D":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        {checked && <span style={{ color:"#fff", fontSize:9, fontWeight:800 }}>✓</span>}
      </div>
      <span style={{ color: checked?"#F0EDE8":"#7A6A5A" }}>{label}</span>
    </div>
  );
}

// ─── USER FORM MODAL ──────────────────────────────────────────────────────
function UserModal({ user, plans, onSave, onClose }) {
  const isNew = !user?.id;
  const [f, setF] = useState(user || { username:"", email:"", password:"", role:"client", status:"active", company:"", subdomain:"", planId:"business", customConfig:{ marches:["maroc","france"], contracts:["freelance","cdi_maroc","cdi_france"], domains:["Dev","Design","Data","Marketing","Finance","Autre"], quota:20, hiddenProfiles:[] } });
  const set = (k,v) => setF(p => ({...p, [k]:v}));
  const setCfg = (k,v) => setF(p => ({...p, customConfig:{...p.customConfig, [k]:v}}));
  const toggleArr = (k, val) => {
    const arr = f.customConfig[k] || [];
    setCfg(k, arr.includes(val) ? arr.filter(x=>x!==val) : [...arr, val]);
  };

  const applyPlan = (planId) => {
    const plan = plans.find(p=>p.id===planId);
    if (plan) { set("planId", planId); setF(p => ({...p, planId, customConfig:{...plan.features}})); }
  };

  const isClient = f.role === "client";

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal slide-in" onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ fontWeight:800, fontSize:17 }}>{isNew ? "Créer un compte" : `Modifier — ${user.username}`}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Infos de base */}
        <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, letterSpacing:".8px", marginBottom:10 }}>INFORMATIONS</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          <div>
            <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>NOM / SOCIÉTÉ</div>
            <input className="input" placeholder="Acme Corp" value={f.username} onChange={e=>set("username",e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>EMAIL</div>
            <input className="input" type="email" placeholder="rh@acme.fr" value={f.email} onChange={e=>set("email",e.target.value)} />
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          <div>
            <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>MOT DE PASSE</div>
            <input className="input" type="password" placeholder={isNew?"Définir un mdp":"Laisser vide = inchangé"} value={f.password} onChange={e=>set("password",e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>RÔLE</div>
            <select className="input" value={f.role} onChange={e=>set("role",e.target.value)}>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin TalentMA</option>
              <option value="collaborateur">Collaborateur</option>
              <option value="client">Client</option>
            </select>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          <div>
            <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>STATUT</div>
            <select className="input" value={f.status} onChange={e=>set("status",e.target.value)}>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="pending">En attente</option>
            </select>
          </div>
          {isClient && (
            <div>
              <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>SOUS-DOMAINE</div>
              <div style={{ display:"flex", alignItems:"center", gap:0 }}>
                <input className="input" style={{ borderRadius:"8px 0 0 8px", borderRight:"none" }} placeholder="acme" value={f.subdomain} onChange={e=>set("subdomain",e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))} />
                <span style={{ background:"#1A1008", border:"1px solid #2A1E12", borderLeft:"none", borderRadius:"0 8px 8px 0", padding:"9px 10px", fontSize:11, color:"#5A4A3A", whiteSpace:"nowrap" }}>.talentma.ma</span>
              </div>
            </div>
          )}
        </div>

        {/* Config client */}
        {isClient && (
          <>
            <div style={{ height:1, background:"#2A1E12", margin:"16px 0" }} />
            <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, letterSpacing:".8px", marginBottom:12 }}>OFFRE & CONFIGURATION</div>

            {/* Plan selector */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:8 }}>OFFRE SOUSCRITE</div>
              <div style={{ display:"flex", gap:8 }}>
                {plans.map(plan => (
                  <div key={plan.id} onClick={() => applyPlan(plan.id)}
                    style={{ flex:1, padding:"10px 8px", borderRadius:10, border:`2px solid ${f.planId===plan.id?plan.color:"#2A1E12"}`, background:f.planId===plan.id?`${plan.color}15`:"#110D06", cursor:"pointer", textAlign:"center" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:f.planId===plan.id?plan.color:"#7A6A5A" }}>{plan.label}</div>
                    <div style={{ fontSize:11, color:"#5A4A3A", marginTop:2 }}>{plan.price} {plan.currency}/mois</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:10, color:"#5A4A3A", marginTop:6 }}>Sélectionner un plan pré-remplit la config ci-dessous. Tu peux l'ajuster manuellement.</div>
            </div>

            {/* Marchés */}
            <div style={{ background:"#110D06", borderRadius:10, padding:14, marginBottom:10 }}>
              <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:8 }}>🌍 MARCHÉS VISIBLES</div>
              {ALL_MARCHES.map(m => (
                <Checkbox key={m} checked={(f.customConfig.marches||[]).includes(m)} onChange={() => toggleArr("marches",m)} label={MARCHE_LABELS[m]} />
              ))}
            </div>

            {/* Contrats */}
            <div style={{ background:"#110D06", borderRadius:10, padding:14, marginBottom:10 }}>
              <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:8 }}>📋 TYPES DE CONTRAT VISIBLES</div>
              {ALL_CONTRACTS.map(c => (
                <Checkbox key={c} checked={(f.customConfig.contracts||[]).includes(c)} onChange={() => toggleArr("contracts",c)} label={CONTRACT_LABELS[c]} />
              ))}
            </div>

            {/* Domaines */}
            <div style={{ background:"#110D06", borderRadius:10, padding:14, marginBottom:10 }}>
              <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:8 }}>🗂️ DOMAINES ACCESSIBLES</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
                {ALL_DOMAINS.map(d => (
                  <Checkbox key={d} checked={(f.customConfig.domains||[]).includes(d)} onChange={() => toggleArr("domains",d)} label={d} />
                ))}
              </div>
            </div>

            {/* Quota + Logo */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              <div style={{ background:"#110D06", borderRadius:10, padding:14 }}>
                <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:8 }}>📊 QUOTA MENSUEL</div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <input type="number" className="input" style={{ width:80 }} min={1} max={999} value={f.customConfig.quota||20}
                    onChange={e => setCfg("quota", Number(e.target.value))} />
                  <span style={{ fontSize:12, color:"#7A6A5A" }}>demandes/mois</span>
                </div>
                <div style={{ fontSize:10, color:"#3A2A18", marginTop:4 }}>999 = illimité</div>
              </div>
              <div style={{ background:"#110D06", borderRadius:10, padding:14 }}>
                <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:8 }}>🏢 NOM ENTREPRISE</div>
                <input className="input" placeholder="Acme Corp" value={f.company||""} onChange={e=>set("company",e.target.value)} />
              </div>
            </div>

            {/* OTP */}
            <div style={{ background:"#110D06", borderRadius:10, padding:14, marginBottom:10 }}>
              <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:8 }}>🔐 AUTHENTIFICATION</div>
              <Checkbox checked={f.customConfig.otpEnabled||false} onChange={v=>setCfg("otpEnabled",v)} label="OTP par email activé" />
              <Checkbox checked={f.customConfig.googleAuth||false} onChange={v=>setCfg("googleAuth",v)} label="Google OAuth autorisé" />
            </div>
          </>
        )}

        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Annuler</button>
          <button className="btn btn-accent" style={{ flex:2 }} onClick={() => onSave(f)}>
            {isNew ? "✓ Créer le compte" : "💾 Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PLAN MODAL ───────────────────────────────────────────────────────────
function PlanModal({ plan, onSave, onClose }) {
  const isNew = !plan?.id;
  const [f, setF] = useState(plan || { id:"", label:"", color:"#7F77DD", price:500, currency:"MAD", features:{ marches:["maroc"], contracts:["freelance"], domains:["Dev"], quota:10, logo:false } });
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const setFeat = (k,v) => setF(p=>({...p,features:{...p.features,[k]:v}}));
  const toggleArr = (k,val) => { const arr=f.features[k]||[]; setFeat(k, arr.includes(val)?arr.filter(x=>x!==val):[...arr,val]); };
  const PALETTE = ["#C8553D","#0F6E56","#185FA5","#BA7517","#7F77DD","#2ECC71","#E67E22","#5BAFD6"];
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal slide-in" onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ fontWeight:800, fontSize:17 }}>{isNew?"Nouvelle offre":`Modifier — ${plan.label}`}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          <div><div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>NOM DE L'OFFRE</div><input className="input" placeholder="Business" value={f.label} onChange={e=>set("label",e.target.value)} /></div>
          <div><div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>PRIX / MOIS</div>
            <div style={{ display:"flex", gap:6 }}>
              <input type="number" className="input" style={{ flex:1 }} value={f.price} onChange={e=>set("price",Number(e.target.value))} />
              <select className="input" style={{ width:80 }} value={f.currency} onChange={e=>set("currency",e.target.value)}>
                <option>MAD</option><option>EUR</option><option>USD</option>
              </select>
            </div>
          </div>
        </div>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:8 }}>COULEUR</div>
          <div style={{ display:"flex", gap:8 }}>
            {PALETTE.map(c=>(
              <div key={c} onClick={()=>set("color",c)} style={{ width:28, height:28, borderRadius:6, background:c, cursor:"pointer", border:`3px solid ${f.color===c?"#fff":"transparent"}` }} />
            ))}
          </div>
        </div>
        <div style={{ background:"#110D06", borderRadius:10, padding:14, marginBottom:10 }}>
          <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:8 }}>MARCHÉS INCLUS</div>
          {ALL_MARCHES.map(m=><Checkbox key={m} checked={(f.features.marches||[]).includes(m)} onChange={()=>toggleArr("marches",m)} label={MARCHE_LABELS[m]} />)}
        </div>
        <div style={{ background:"#110D06", borderRadius:10, padding:14, marginBottom:10 }}>
          <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:8 }}>CONTRATS INCLUS</div>
          {ALL_CONTRACTS.map(c=><Checkbox key={c} checked={(f.features.contracts||[]).includes(c)} onChange={()=>toggleArr("contracts",c)} label={CONTRACT_LABELS[c]} />)}
        </div>
        <div style={{ background:"#110D06", borderRadius:10, padding:14, marginBottom:10 }}>
          <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:8 }}>DOMAINES INCLUS</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }}>
            {ALL_DOMAINS.map(d=><Checkbox key={d} checked={(f.features.domains||[]).includes(d)} onChange={()=>toggleArr("domains",d)} label={d} />)}
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          <div style={{ background:"#110D06", borderRadius:10, padding:14 }}>
            <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:8 }}>QUOTA MENSUEL</div>
            <input type="number" className="input" value={f.features.quota} onChange={e=>setFeat("quota",Number(e.target.value))} />
            <div style={{ fontSize:10, color:"#3A2A18", marginTop:4 }}>999 = illimité</div>
          </div>
          <div style={{ background:"#110D06", borderRadius:10, padding:14 }}>
            <div style={{ fontSize:11, color:"#5A4A3A", fontWeight:700, marginBottom:8 }}>OPTIONS</div>
            <Checkbox checked={f.features.logo||false} onChange={v=>setFeat("logo",v)} label="Logo entreprise" />
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Annuler</button>
          <button className="btn btn-accent" style={{ flex:2 }} onClick={()=>onSave({...f, id:f.id||f.label.toLowerCase().replace(/\s+/g,"-")})}>
            {isNew?"✓ Créer l'offre":"💾 Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────
export default function SuperAdmin() {
  const [users, setUsers]   = useState([]);
  const [plans, setPlans]   = useState([]);
  const [section, setSection] = useState("users");
  const [search, setSearch]   = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");
  const [userModal, setUserModal]   = useState(null); // null | "new" | user obj
  const [planModal, setPlanModal]   = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast]   = useState("");
  const [viewingClient, setViewingClient] = useState(null);

  useEffect(() => {
    load("sa-users").then(u => setUsers(u || DEFAULT_USERS));
    load("sa-plans").then(p => setPlans(p || DEFAULT_PLANS));
  }, []);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const persistUsers = async (u) => { setUsers(u); await save("sa-users", u); };
  const persistPlans = async (p) => { setPlans(p); await save("sa-plans", p); };

  const saveUser = async (u) => {
    const existing = users.find(x => x.id === u.id);
    let next;
    if (existing) {
      next = users.map(x => x.id===u.id ? { ...x, ...u } : x);
      flash("Compte mis à jour ✓");
    } else {
      next = [...users, { ...u, id: Date.now(), createdAt: new Date().toISOString().split("T")[0], lastLogin: null }];
      flash("Compte créé ✓");
    }
    await persistUsers(next);
    setUserModal(null);
  };

  const toggleStatus = async (user) => {
    const next = users.map(u => u.id===user.id ? { ...u, status: u.status==="active"?"suspended":"active" } : u);
    await persistUsers(next);
    flash(user.status==="active" ? "Compte suspendu" : "Compte réactivé ✓");
  };

  const deleteUser = async (user) => {
    await persistUsers(users.filter(u => u.id!==user.id));
    setConfirmModal(null);
    flash("Compte supprimé");
  };

  const savePlan = async (p) => {
    const existing = plans.find(x=>x.id===p.id);
    const next = existing ? plans.map(x=>x.id===p.id?p:x) : [...plans, p];
    await persistPlans(next);
    setPlanModal(null);
    flash(existing?"Offre mise à jour ✓":"Offre créée ✓");
  };

  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    const ms = !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const mr = roleFilter==="Tous" || u.role===roleFilter;
    return ms && mr;
  }), [users, search, roleFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    clients: users.filter(u=>u.role==="client").length,
    active: users.filter(u=>u.status==="active").length,
    suspended: users.filter(u=>u.status==="suspended").length,
    pending: users.filter(u=>u.status==="pending").length,
  }), [users]);

  return (
    <div style={{ minHeight:"100vh", background:"#0D0A06" }}>
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:16, right:16, background:"#0D3320", border:"1px solid #1A7A43", borderRadius:10, padding:"10px 18px", fontSize:13, color:"#2ECC71", zIndex:200, fontWeight:600 }}>
          ✓ {toast}
        </div>
      )}

      {/* NAV */}
      <div style={{ background:"#110D06", borderBottom:"1px solid #2A1E12", padding:"0 16px", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", alignItems:"center", height:52, gap:10 }}>
          <div style={{ marginRight:"auto" }}>
            <div style={{ fontSize:14, fontWeight:800 }}>🇲🇦 TalentMA <span style={{ fontSize:10, color:"#C8553D" }}>Super Admin</span></div>
          </div>
          {[["users","👥 Comptes"],["plans","📦 Offres"],["stats","📊 Stats"]].map(([s,l]) => (
            <button key={s} className={`nav-tab ${section===s?"active":""}`} onClick={()=>setSection(s)}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"16px" }}>

        {/* ══ STATS BAND */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8, marginBottom:16 }}>
          {[["Total",stats.total,"#F0EDE8"],["Clients",stats.clients,"#0F6E56"],["Actifs",stats.active,"#2ECC71"],["Suspendus",stats.suspended,"#E74C3C"],["En attente",stats.pending,"#F0B429"]].map(([l,v,c]) => (
            <div key={l} className="card" style={{ padding:"10px", textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:800, color:c, fontFamily:"'JetBrains Mono'" }}>{v}</div>
              <div style={{ fontSize:10, color:"#5A4A3A", marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* ══ COMPTES */}
        {section === "users" && (
          <div className="slide-in">
            <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
              <input className="input" style={{ flex:"1 1 200px" }} placeholder="🔍 Rechercher un compte…" value={search} onChange={e=>setSearch(e.target.value)} />
              <select className="input" style={{ flex:"0 0 140px" }} value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
                <option value="Tous">Tous les rôles</option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="collaborateur">Collaborateur</option>
                <option value="client">Client</option>
              </select>
              <button className="btn btn-accent" onClick={()=>setUserModal("new")}>+ Créer un compte</button>
            </div>

            <div className="card">
              {filtered.length === 0
                ? <div style={{ padding:"40px", textAlign:"center", color:"#5A4A3A" }}>Aucun compte trouvé</div>
                : filtered.map(u => (
                    <div key={u.id} className="row">
                      {/* Avatar */}
                      <div style={{ width:36, height:36, borderRadius:9, background:"#C8553D20", border:"1px solid #C8553D40", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#C8553D", flexShrink:0 }}>
                        {u.username[0].toUpperCase()}
                      </div>
                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:2 }}>
                          <span style={{ fontWeight:700, fontSize:13 }}>{u.username}</span>
                          <Badge role={u.role} />
                          <StatusBadge status={u.status} />
                          {u.planId && <PlanBadge planId={u.planId} plans={plans} />}
                        </div>
                        <div style={{ fontSize:11, color:"#5A4A3A" }}>
                          {u.email}
                          {u.subdomain && <span style={{ marginLeft:8, color:"#3A2A18" }}>🔗 {u.subdomain}.talentma.ma</span>}
                          {u.lastLogin && <span style={{ marginLeft:8, color:"#3A2A18" }}>Dernière connexion : {u.lastLogin}</span>}
                        </div>
                      </div>
                      {/* Actions */}
                      <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                        {u.role === "client" && (
                          <button className="btn btn-ghost btn-sm" style={{ color:"#0F6E56", borderColor:"#0F6E5640" }}
                            onClick={()=>setViewingClient(u)}>
                            Voir config
                          </button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={()=>setUserModal(u)}>Modifier</button>
                        <button className="btn btn-ghost btn-sm"
                          style={{ color:u.status==="active"?"#E74C3C":"#2ECC71", borderColor:u.status==="active"?"#7A1E17":"#1A7A43" }}
                          onClick={()=>toggleStatus(u)}>
                          {u.status==="active"?"Suspendre":"Réactiver"}
                        </button>
                        {u.role !== "superadmin" && (
                          <button className="btn btn-danger btn-sm"
                            onClick={()=>setConfirmModal(u)}>🗑</button>
                        )}
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        )}

        {/* ══ OFFRES */}
        {section === "plans" && (
          <div className="slide-in">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:14, color:"#7A6A5A" }}>{plans.length} offre{plans.length>1?"s":""} disponible{plans.length>1?"s":""}</div>
              <button className="btn btn-accent" onClick={()=>setPlanModal("new")}>+ Créer une offre</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
              {plans.map(plan => (
                <div key={plan.id} className="card" style={{ padding:18, borderTop:`3px solid ${plan.color}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div>
                      <div style={{ fontWeight:800, fontSize:16, color:plan.color }}>{plan.label}</div>
                      <div style={{ fontSize:13, color:"#7A6A5A", marginTop:2 }}>{plan.price} {plan.currency}/mois</div>
                    </div>
                    <span style={{ fontSize:11, color:"#5A4A3A", background:"#1A1008", padding:"2px 8px", borderRadius:6, fontFamily:"'JetBrains Mono'" }}>
                      {users.filter(u=>u.planId===plan.id).length} client{users.filter(u=>u.planId===plan.id).length>1?"s":""}
                    </span>
                  </div>
                  <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:6 }}>
                    <div style={{ marginBottom:4 }}>🌍 {(plan.features.marches||[]).map(m=>MARCHE_LABELS[m]).join(" · ")}</div>
                    <div style={{ marginBottom:4 }}>📋 {(plan.features.contracts||[]).map(c=>CONTRACT_LABELS[c]).join(" · ")}</div>
                    <div style={{ marginBottom:4 }}>🗂️ {(plan.features.domains||[]).join(" · ")}</div>
                    <div>📊 {plan.features.quota===999?"Illimité":`${plan.features.quota} demandes/mois`}</div>
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:14 }}>
                    <button className="btn btn-ghost btn-sm" style={{ flex:1 }} onClick={()=>setPlanModal(plan)}>Modifier</button>
                    {users.filter(u=>u.planId===plan.id).length===0 && (
                      <button className="btn btn-danger btn-sm" onClick={async()=>{ await persistPlans(plans.filter(p=>p.id!==plan.id)); flash("Offre supprimée"); }}>🗑</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ STATS */}
        {section === "stats" && (
          <div className="slide-in">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              {/* Répartition par rôle */}
              <div className="card" style={{ padding:18 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Répartition par rôle</div>
                {["superadmin","admin","collaborateur","client"].map(role => {
                  const count = users.filter(u=>u.role===role).length;
                  const rc = ROLE_CONFIG[role];
                  return (
                    <div key={role} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                        <span style={{ color:"#7A6A5A" }}>{rc.label}</span>
                        <span style={{ color:rc.color, fontFamily:"'JetBrains Mono'", fontWeight:700 }}>{count}</span>
                      </div>
                      <div style={{ height:5, background:"#1E1208", borderRadius:3 }}>
                        <div style={{ height:"100%", width:`${users.length>0?Math.round(count/users.length*100):0}%`, background:rc.color, borderRadius:3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Clients par offre */}
              <div className="card" style={{ padding:18 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Clients par offre</div>
                {plans.map(plan => {
                  const count = users.filter(u=>u.planId===plan.id).length;
                  return (
                    <div key={plan.id} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                        <span style={{ color:"#7A6A5A" }}>{plan.label}</span>
                        <span style={{ color:plan.color, fontFamily:"'JetBrains Mono'", fontWeight:700 }}>{count}</span>
                      </div>
                      <div style={{ height:5, background:"#1E1208", borderRadius:3 }}>
                        <div style={{ height:"100%", width:`${users.filter(u=>u.role==="client").length>0?Math.round(count/users.filter(u=>u.role==="client").length*100):0}%`, background:plan.color, borderRadius:3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Liste clients actifs */}
            <div className="card" style={{ padding:18 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Clients actifs</div>
              {users.filter(u=>u.role==="client"&&u.status==="active").map(u => (
                <div key={u.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0", borderBottom:"1px solid #2A1E12" }}>
                  <span style={{ flex:1, fontSize:13, fontWeight:600 }}>{u.company||u.username}</span>
                  <PlanBadge planId={u.planId} plans={plans} />
                  <span style={{ fontSize:11, color:"#5A4A3A" }}>{u.subdomain}.talentma.ma</span>
                  <span style={{ fontSize:11, color:"#5A4A3A" }}>Dernière co: {u.lastLogin||"Jamais"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══ MODAL VOIR CONFIG CLIENT */}
      {viewingClient && (
        <div className="overlay" onClick={()=>setViewingClient(null)}>
          <div className="modal slide-in" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:17 }}>{viewingClient.company||viewingClient.username}</div>
                <div style={{ fontSize:12, color:"#7A6A5A" }}>{viewingClient.subdomain}.talentma.ma</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={()=>setViewingClient(null)}>✕</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              {[
                ["Offre", <PlanBadge planId={viewingClient.planId} plans={plans} />],
                ["Statut", <StatusBadge status={viewingClient.status} />],
                ["Email", viewingClient.email],
                ["Quota", `${viewingClient.customConfig?.quota===999?"Illimité":viewingClient.customConfig?.quota||"—"} demandes/mois`],
              ].map(([l,v]) => (
                <div key={l} style={{ background:"#110D06", borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>{l}</div>
                  <div style={{ fontSize:13 }}>{v}</div>
                </div>
              ))}
            </div>
            {[
              ["🌍 Marchés visibles", (viewingClient.customConfig?.marches||[]).map(m=>MARCHE_LABELS[m]).join(" · ")],
              ["📋 Contrats visibles", (viewingClient.customConfig?.contracts||[]).map(c=>CONTRACT_LABELS[c]).join(" · ")],
              ["🗂️ Domaines accessibles", (viewingClient.customConfig?.domains||[]).join(" · ")],
            ].map(([l,v]) => (
              <div key={l} style={{ background:"#110D06", borderRadius:8, padding:"10px 12px", marginBottom:8 }}>
                <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>{l}</div>
                <div style={{ fontSize:13, color:"#D5BDAC" }}>{v||"—"}</div>
              </div>
            ))}
            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={()=>setViewingClient(null)}>Fermer</button>
              <button className="btn btn-accent" style={{ flex:2 }} onClick={()=>{ setUserModal(viewingClient); setViewingClient(null); }}>✏️ Modifier la config</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ USER MODAL */}
      {userModal && <UserModal user={userModal==="new"?null:userModal} plans={plans} onSave={saveUser} onClose={()=>setUserModal(null)} />}

      {/* ══ PLAN MODAL */}
      {planModal && <PlanModal plan={planModal==="new"?null:planModal} onSave={savePlan} onClose={()=>setPlanModal(null)} />}

      {/* ══ CONFIRM DELETE */}
      {confirmModal && (
        <div className="overlay" onClick={()=>setConfirmModal(null)}>
          <div className="modal slide-in" style={{ maxWidth:380, textAlign:"center" }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:8 }}>Supprimer ce compte ?</div>
            <div style={{ fontSize:13, color:"#7A6A5A", marginBottom:20 }}>
              <b style={{ color:"#F0EDE8" }}>{confirmModal.username}</b> — cette action est irréversible.
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={()=>setConfirmModal(null)}>Annuler</button>
              <button className="btn btn-danger" style={{ flex:1, justifyContent:"center" }} onClick={()=>deleteUser(confirmModal)}>Supprimer définitivement</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
