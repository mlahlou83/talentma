import { useState, useEffect } from "react";

async function load(key) { try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; } }
async function save(key, val) { try { await window.storage.set(key, JSON.stringify(val)); } catch {} }

const NOMS_TRES_FORTS = ["benali","chraibi","el fassi","idrissi","tazi","berrada","mansouri","ouazzani","kettani","bensouda","lahlou","alaoui","fassi","benbrahim","benjelloun","tahiri","filali","bennani","bennis","skalli","sebti"];
const NOMS_FORTS = ["bouazza","rahimi","ziani","amrani","belhaj","saidi","moussaoui","cherkaoui","bouzidi","hajji","kabbaj","naciri","belghiti","ouali","benomar","boussaid","laabid","lamrani","mechbal","naji"];
const PRENOMS_MA = ["mohammed","mohamed","youssef","amine","mehdi","karim","hamid","rachid","nadia","imane","fatima","khadija","zineb","salma","yasmine","loubna","rania","ghita","hajar","meryem","ibrahim","omar","bilal","soufiane","tariq","driss","mustapha"];
const ECOLES_MAROC = ["mohammed v","um5","iscae","hec casablanca","hec rabat","emi","encg","esith","uir","hassan ii","cadi ayyad","inpt","ibn tofail","ensias","enset","abdelmalek","al akhawayn","aui","sidi mohamed","moulay ismail","enim"];
const EXP_MAROC = ["maroc","morocco","ocp","maroc telecom","attijariwafa","bmce","cih","banque populaire","wafa","oncf","royal air maroc","inwi","orange maroc","casablanca","rabat","marrakech","fès","agadir","tanger","cdg","hps"];

function scoreProfile(p) {
  const nom = (p.lastName||"").toLowerCase();
  const prenom = (p.firstName||"").toLowerCase();
  const ecoles = (p.education||"").toLowerCase();
  const exp = (p.experience||"").toLowerCase();
  let score = 0;
  if (NOMS_TRES_FORTS.some(n=>nom.includes(n))) score+=40;
  else if (NOMS_FORTS.some(n=>nom.includes(n))) score+=25;
  if (PRENOMS_MA.some(n=>prenom.includes(n))) score+=10;
  if (ECOLES_MAROC.some(e=>ecoles.includes(e))) score+=25;
  if (EXP_MAROC.some(e=>exp.includes(e))) score+=30;
  return score;
}

const SKILLS_BY_DOMAIN = {
  Dev:["React","Vue.js","Node.js","Laravel","Python","TypeScript","Flutter","React Native","AWS","Docker","PHP","WordPress"],
  Design:["Figma","Adobe XD","Illustrator","Photoshop","Motion Design","Branding","Webflow","UI/UX"],
  Data:["Python","SQL","Power BI","Tableau","Machine Learning","R","Excel","NLP","BigQuery"],
  Marketing:["SEO","Google Ads","Facebook Ads","CRM","Copywriting","Analytics","Email Marketing"],
  Finance:["Excel","Sage","Comptabilité","Fiscalité","Audit","Contrôle de gestion","SAP"],
  Autre:[],
};

const DOMAINS = ["Dev","Design","Data","Marketing","Finance","Autre"];
const CONTRACT_TYPES = [
  { id:"freelance",  label:"Freelance",  desc:"Missions courtes ou longues, je travaille en indépendant" },
  { id:"cdi_maroc",  label:"CDI Maroc",  desc:"Je cherche un poste permanent au Maroc" },
  { id:"cdi_france", label:"CDI France", desc:"Je souhaite m'installer en France (visa accompagné)" },
];
const MARCHES = [
  { id:"maroc",  label:"🇲🇦 Maroc",  desc:"Clients basés au Maroc" },
  { id:"france", label:"🇫🇷 France", desc:"Clients basés en France" },
  { id:"both",   label:"🌍 Les deux", desc:"Ouvert aux deux marchés" },
];

const STEPS = ["Profil","Compétences","Expérience","Disponibilité","Confirmation"];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0D0A06;color:#F0EDE8;font-family:'Syne',sans-serif}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#110D06}::-webkit-scrollbar-thumb{background:#3A2A18;border-radius:2px}
.btn{cursor:pointer;border:none;border-radius:8px;font-family:'Syne',sans-serif;font-weight:600;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
.btn-accent{background:#C8553D;color:#fff;padding:10px 20px;font-size:13px}.btn-accent:hover{background:#E06040}
.btn-accent:disabled{background:#3A2A18;color:#5A4A3A;cursor:not-allowed}
.btn-ghost{background:transparent;color:#7A6A5A;padding:9px 18px;font-size:13px;border:1px solid #2A1E12}.btn-ghost:hover{border-color:#C8553D;color:#C8553D}
.btn-teal{background:#0F6E56;color:#fff;padding:10px 20px;font-size:13px}.btn-teal:hover{background:#1A9070}
.card{background:#1A1008;border:1px solid #2A1E12;border-radius:12px}
.input{background:#110D06;border:1px solid #2A1E12;border-radius:8px;padding:10px 14px;color:#F0EDE8;font-family:'Syne',sans-serif;font-size:13px;outline:none;width:100%;transition:border-color .15s}
.input:focus{border-color:#C8553D}
textarea.input{resize:vertical;min-height:80px}
select.input{cursor:pointer;appearance:none}
.tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:4px;font-size:11px;font-family:'JetBrains Mono';font-weight:500}
.slide-in{animation:si .25s ease}@keyframes si{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.choice-card{border:2px solid #2A1E12;border-radius:10px;padding:14px;cursor:pointer;transition:all .15s;background:#110D06}
.choice-card:hover{border-color:#C8553D40}
.choice-card.selected{border-color:#C8553D;background:#C8553D10}
.skill-tag{font-size:11px;padding:4px 11px;border-radius:5px;cursor:pointer;transition:all .1s;user-select:none;font-family:'Syne',sans-serif}
.skill-tag.active{background:#C8553D20;color:#C8553D;border:1px solid #C8553D50}
.skill-tag.inactive{background:#1E1208;color:#7A6A5A;border:1px solid #2A1E12}
.skill-tag.inactive:hover{border-color:#C8553D30;color:#D5BDAC}
`;

export default function FreelancePortal() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [myProfile, setMyProfile] = useState(null);
  const [checking, setChecking] = useState(true);

  const [form, setForm] = useState({
    firstName:"", lastName:"", email:"", phone:"", location:"",
    linkedinUrl:"", contractType:"freelance", marche:"both",
    domain:"Dev", skills:[], bio:"", education:"", experience:"",
    disponible:true, disponibleDate:"", tjm:"", remote:true,
  });

  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const toggleSkill = s => set("skills", form.skills.includes(s) ? form.skills.filter(x=>x!==s) : [...form.skills, s]);

  useEffect(() => {
    load("freelance-my-profile").then(p => {
      if (p) setMyProfile(p);
      setChecking(false);
    });
  }, []);

  const handleSubmit = async () => {
    const score = scoreProfile(form);
    const profile = {
      ...form, id: Date.now(), score,
      niveau: score>=80?"🟢 Très probable":score>=50?"🟡 Probable":score>=25?"🟠 Possible":"🔴 Incertain",
      screened: false, screeningNote:"", pipelineStage:"nouveau",
      createdAt: new Date().toISOString(), status:"pending_review",
    };
    await save("freelance-my-profile", profile);
    const all = await load("freelance-submissions") || [];
    await save("freelance-submissions", [...all, profile]);
    setMyProfile(profile);
    setSubmitted(true);
  };

  const canNext = () => {
    if (step===0) return form.firstName && form.lastName && form.email && form.phone;
    if (step===1) return form.domain && form.skills.length > 0;
    if (step===2) return form.bio && form.education;
    if (step===3) return true;
    return true;
  };

  if (checking) return <div style={{minHeight:"100vh",background:"#0D0A06",display:"flex",alignItems:"center",justifyContent:"center",color:"#5A4A3A",fontFamily:"'Syne',sans-serif"}}>Chargement…</div>;

  // ── VUE PROFIL EXISTANT
  if (myProfile && !submitted) return (
    <div style={{minHeight:"100vh",background:"#0D0A06"}}>
      <style>{css}</style>
      <div style={{background:"#110D06",borderBottom:"1px solid #2A1E12",padding:"0 16px"}}>
        <div style={{maxWidth:680,margin:"0 auto",display:"flex",alignItems:"center",height:54,gap:12}}>
          <span style={{fontSize:22}}>🇲🇦</span>
          <div><div style={{fontSize:14,fontWeight:800}}>TalentMA</div><div style={{fontSize:9,color:"#5A4A3A",fontFamily:"'JetBrains Mono'",letterSpacing:"1px"}}>ESPACE FREELANCE</div></div>
        </div>
      </div>
      <div style={{maxWidth:680,margin:"0 auto",padding:20}}>
        <div style={{background:"#0D3320",border:"1px solid #1A7A43",borderRadius:12,padding:"16px 20px",marginBottom:20}}>
          <div style={{fontWeight:700,color:"#2ECC71",marginBottom:4}}>✓ Votre profil est enregistré</div>
          <div style={{fontSize:12,color:"#9FE1CB"}}>Notre équipe l'examine. Vous serez contacté sous 48h ouvrées.</div>
        </div>
        <div className="card" style={{padding:20}}>
          <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:18}}>
            <div style={{width:56,height:56,borderRadius:14,background:"#C8553D20",border:"1px solid #C8553D40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:"#C8553D"}}>
              {myProfile.firstName[0]}{myProfile.lastName[0]}
            </div>
            <div>
              <div style={{fontWeight:800,fontSize:18}}>{myProfile.firstName} {myProfile.lastName}</div>
              <div style={{fontSize:12,color:"#7A6A5A"}}>{myProfile.headline||myProfile.domain}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {[["💼 Contrat",myProfile.contractType==="freelance"?"Freelance":myProfile.contractType==="cdi_maroc"?"CDI Maroc":"CDI France"],["🎯 Domaine",myProfile.domain],["📍 Localisation",myProfile.location],["⚡ Disponible",myProfile.disponible?"Oui":"Non"]].map(([l,v])=>(
              <div key={l} style={{background:"#110D06",borderRadius:8,padding:"8px 12px"}}>
                <div style={{fontSize:10,color:"#5A4A3A",marginBottom:2}}>{l}</div>
                <div style={{fontSize:13}}>{v}</div>
              </div>
            ))}
          </div>
          {myProfile.skills?.length>0 && (
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:"#5A4A3A",marginBottom:6}}>🔧 COMPÉTENCES</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {myProfile.skills.map(s=><span key={s} className="tag" style={{background:"#1E1208",color:"#D5BDAC",border:"1px solid #2A1E12"}}>{s}</span>)}
              </div>
            </div>
          )}
          <div style={{padding:"12px 14px",background:"#1E1400",borderRadius:8,border:"1px solid #5C3D00",fontSize:12,color:"#F0B429"}}>
            ⏳ Statut : <b>En cours d'examen</b> — L'équipe TalentMA vous contactera pour planifier l'entretien de screening.
          </div>
          <button className="btn btn-ghost" style={{width:"100%",marginTop:14,justifyContent:"center"}} onClick={()=>{setMyProfile(null);setSubmitted(false);}}>
            Modifier mon profil
          </button>
        </div>
      </div>
    </div>
  );

  // ── VUE CONFIRMATION
  if (submitted) return (
    <div style={{minHeight:"100vh",background:"#0D0A06",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{css}</style>
      <div style={{maxWidth:480,width:"100%",textAlign:"center"}} className="slide-in">
        <div style={{fontSize:60,marginBottom:20}}>🎉</div>
        <div style={{fontSize:24,fontWeight:800,marginBottom:8}}>Profil soumis !</div>
        <div style={{fontSize:13,color:"#7A6A5A",marginBottom:30,lineHeight:1.7}}>
          Merci {form.firstName}. Notre équipe examine votre profil et vous contactera sous <b style={{color:"#F0EDE8"}}>48h ouvrées</b> pour planifier votre entretien de screening.
        </div>
        <div style={{background:"#1A1008",border:"1px solid #2A1E12",borderRadius:12,padding:20,marginBottom:24,textAlign:"left"}}>
          <div style={{fontSize:11,color:"#5A4A3A",marginBottom:12,fontWeight:700}}>PROCHAINES ÉTAPES</div>
          {[["1","Examen de votre profil par l'équipe TalentMA","24h"],["2","Entretien de screening avec notre partenaire indépendant","48-72h"],["3","Badge certifié ajouté à votre profil","Après screening"],["4","Votre profil est visible par les clients","Immédiat après"]].map(([n,t,d])=>(
            <div key={n} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"8px 0",borderBottom:"1px solid #2A1E12"}}>
              <div style={{width:24,height:24,borderRadius:6,background:"#C8553D20",border:"1px solid #C8553D40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#C8553D",fontWeight:800,flexShrink:0}}>{n}</div>
              <div style={{flex:1}}><div style={{fontSize:13}}>{t}</div><div style={{fontSize:11,color:"#5A4A3A",marginTop:2}}>{d}</div></div>
            </div>
          ))}
        </div>
        <button className="btn btn-accent" style={{width:"100%",padding:13,justifyContent:"center"}} onClick={()=>setSubmitted(false)}>
          Voir mon profil →
        </button>
      </div>
    </div>
  );

  // ── FORMULAIRE MULTI-ÉTAPES
  return (
    <div style={{minHeight:"100vh",background:"#0D0A06"}}>
      <style>{css}</style>

      {/* Header */}
      <div style={{background:"#110D06",borderBottom:"1px solid #2A1E12",padding:"0 16px",position:"sticky",top:0,zIndex:50}}>
        <div style={{maxWidth:680,margin:"0 auto",display:"flex",alignItems:"center",height:54,gap:12}}>
          <span style={{fontSize:22}}>🇲🇦</span>
          <div><div style={{fontSize:14,fontWeight:800}}>TalentMA</div><div style={{fontSize:9,color:"#5A4A3A",fontFamily:"'JetBrains Mono'",letterSpacing:"1px"}}>INSCRIPTION FREELANCE</div></div>
        </div>
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"20px 16px"}}>

        {/* Progress */}
        <div style={{marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            {STEPS.map((s,i)=>(
              <div key={s} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:i<step?"#C8553D":i===step?"#C8553D":"#1E1208",border:`2px solid ${i<=step?"#C8553D":"#2A1E12"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:i<=step?"#fff":"#5A4A3A",marginBottom:4,transition:"all .2s"}}>
                  {i<step?"✓":i+1}
                </div>
                <div style={{fontSize:9,color:i===step?"#C8553D":"#5A4A3A",fontWeight:i===step?700:400,textAlign:"center"}}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{height:3,background:"#1E1208",borderRadius:2}}>
            <div style={{height:"100%",width:`${(step/4)*100}%`,background:"#C8553D",borderRadius:2,transition:"width .3s"}} />
          </div>
        </div>

        {/* STEP 0 — Profil */}
        {step===0 && (
          <div className="slide-in">
            <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Votre profil</div>
            <div style={{fontSize:12,color:"#7A6A5A",marginBottom:20}}>Informations de base pour créer votre compte TalentMA</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><div style={{fontSize:11,color:"#5A4A3A",marginBottom:5}}>PRÉNOM *</div><input className="input" placeholder="Karim" value={form.firstName} onChange={e=>set("firstName",e.target.value)} /></div>
              <div><div style={{fontSize:11,color:"#5A4A3A",marginBottom:5}}>NOM *</div><input className="input" placeholder="Ouazzani" value={form.lastName} onChange={e=>set("lastName",e.target.value)} /></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><div style={{fontSize:11,color:"#5A4A3A",marginBottom:5}}>EMAIL *</div><input className="input" type="email" placeholder="karim@email.com" value={form.email} onChange={e=>set("email",e.target.value)} /></div>
              <div><div style={{fontSize:11,color:"#5A4A3A",marginBottom:5}}>TÉLÉPHONE *</div><input className="input" placeholder="+212 6…" value={form.phone} onChange={e=>set("phone",e.target.value)} /></div>
            </div>
            <div style={{marginBottom:12}}><div style={{fontSize:11,color:"#5A4A3A",marginBottom:5}}>VILLE / PAYS</div><input className="input" placeholder="Casablanca, Maroc" value={form.location} onChange={e=>set("location",e.target.value)} /></div>
            <div style={{marginBottom:20}}><div style={{fontSize:11,color:"#5A4A3A",marginBottom:5}}>URL LINKEDIN</div><input className="input" placeholder="https://linkedin.com/in/…" value={form.linkedinUrl} onChange={e=>set("linkedinUrl",e.target.value)} /></div>

            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:"#5A4A3A",marginBottom:10}}>TYPE DE CONTRAT *</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {CONTRACT_TYPES.map(c=>(
                  <div key={c.id} className={`choice-card ${form.contractType===c.id?"selected":""}`} onClick={()=>set("contractType",c.id)}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${form.contractType===c.id?"#C8553D":"#3A2A18"}`,background:form.contractType===c.id?"#C8553D":"transparent",flexShrink:0}} />
                      <div>
                        <div style={{fontWeight:700,fontSize:13,color:form.contractType===c.id?"#C8553D":"#F0EDE8"}}>{c.label}</div>
                        <div style={{fontSize:11,color:"#7A6A5A"}}>{c.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{fontSize:11,color:"#5A4A3A",marginBottom:10}}>MARCHÉ CIBLE</div>
              <div style={{display:"flex",gap:8}}>
                {MARCHES.map(m=>(
                  <div key={m.id} className={`choice-card ${form.marche===m.id?"selected":""}`} style={{flex:1}} onClick={()=>set("marche",m.id)}>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontWeight:700,fontSize:12,color:form.marche===m.id?"#C8553D":"#F0EDE8"}}>{m.label}</div>
                      <div style={{fontSize:10,color:"#7A6A5A",marginTop:2}}>{m.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 1 — Compétences */}
        {step===1 && (
          <div className="slide-in">
            <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Vos compétences</div>
            <div style={{fontSize:12,color:"#7A6A5A",marginBottom:20}}>Sélectionnez votre domaine puis vos compétences principales</div>

            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,color:"#5A4A3A",marginBottom:10}}>DOMAINE PRINCIPAL *</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {DOMAINS.map(d=>(
                  <button key={d} onClick={()=>{set("domain",d);set("skills",[]);}}
                    style={{padding:"8px 16px",borderRadius:8,border:`2px solid ${form.domain===d?"#C8553D":"#2A1E12"}`,background:form.domain===d?"#C8553D15":"#110D06",color:form.domain===d?"#C8553D":"#7A6A5A",cursor:"pointer",fontWeight:form.domain===d?700:400,fontFamily:"'Syne'",fontSize:13,transition:"all .15s"}}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,color:"#5A4A3A",marginBottom:10}}>
                COMPÉTENCES * <span style={{color:"#C8553D"}}>({form.skills.length} sélectionnée{form.skills.length>1?"s":""})</span>
              </div>
              <div style={{background:"#110D06",borderRadius:10,padding:14,display:"flex",flexWrap:"wrap",gap:7}}>
                {(SKILLS_BY_DOMAIN[form.domain]||[]).map(s=>(
                  <span key={s} className={`skill-tag ${form.skills.includes(s)?"active":"inactive"}`} onClick={()=>toggleSkill(s)}>
                    {form.skills.includes(s)?"✓ ":""}{s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{fontSize:11,color:"#5A4A3A",marginBottom:6}}>AUTRE COMPÉTENCE</div>
              <div style={{display:"flex",gap:8}}>
                <input className="input" placeholder="Ex: GraphQL, Kubernetes…" id="skillInput" onKeyDown={e=>{if(e.key==="Enter"){const v=e.target.value.trim();if(v&&!form.skills.includes(v)){toggleSkill(v);e.target.value="";}}}} />
                <button className="btn btn-ghost" style={{flexShrink:0}} onClick={()=>{const el=document.getElementById("skillInput");const v=el.value.trim();if(v&&!form.skills.includes(v)){toggleSkill(v);el.value="";}}}>+</button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Expérience */}
        {step===2 && (
          <div className="slide-in">
            <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Votre parcours</div>
            <div style={{fontSize:12,color:"#7A6A5A",marginBottom:20}}>Ces informations permettent de calculer votre score et de vous présenter aux bons clients</div>

            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:"#5A4A3A",marginBottom:6}}>BIO PROFESSIONNELLE * <span style={{color:"#5A4A3A",fontWeight:400}}>(2-3 phrases)</span></div>
              <textarea className="input" placeholder="Ex: Développeur Full Stack avec 5 ans d'expérience, spécialisé React et Node.js. Ancien consultant chez OCP Maroc, je travaille maintenant en freelance depuis Paris." value={form.bio} onChange={e=>set("bio",e.target.value)} style={{minHeight:100}} />
            </div>

            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:"#5A4A3A",marginBottom:6}}>FORMATIONS ET ÉCOLES *</div>
              <textarea className="input" placeholder="Ex: Université Mohammed V Rabat (Licence Informatique 2018), ISCAE Casablanca (MBA 2020)" value={form.education} onChange={e=>set("education",e.target.value)} />
            </div>

            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:"#5A4A3A",marginBottom:6}}>EXPÉRIENCES PROFESSIONNELLES</div>
              <textarea className="input" placeholder="Ex: OCP Maroc (2019-2021, Développeur Senior), Capgemini Paris (2021-2023, Tech Lead), Freelance depuis 2023" value={form.experience} onChange={e=>set("experience",e.target.value)} />
            </div>

            {form.contractType==="freelance" && (
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,color:"#5A4A3A",marginBottom:6}}>TJM SOUHAITÉ (€/jour)</div>
                <input className="input" type="number" placeholder="Ex: 500" value={form.tjm} onChange={e=>set("tjm",e.target.value)} />
              </div>
            )}

            {/* Score preview */}
            {(form.firstName||form.education||form.experience) && (
              <div style={{background:"#1A1008",border:"1px solid #2A1E12",borderRadius:10,padding:14}}>
                <div style={{fontSize:11,color:"#5A4A3A",marginBottom:8}}>APERÇU DE VOTRE SCORE</div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:32,fontWeight:800,color:"#C8553D",fontFamily:"'JetBrains Mono'"}}>{scoreProfile(form)}</div>
                  <div>
                    <div style={{fontSize:12,color:"#7A6A5A"}}>points sur 105</div>
                    <div style={{fontSize:12,marginTop:2,color: scoreProfile(form)>=70?"#2ECC71":scoreProfile(form)>=40?"#F0B429":"#E74C3C"}}>
                      {scoreProfile(form)>=70?"🟢 Très bon profil":scoreProfile(form)>=40?"🟡 Bon profil":"🟠 Profil à enrichir"}
                    </div>
                  </div>
                </div>
                <div style={{fontSize:11,color:"#5A4A3A",marginTop:8}}>Plus vous ajoutez d'écoles et d'expériences marocaines, plus votre score augmente.</div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — Disponibilité */}
        {step===3 && (
          <div className="slide-in">
            <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Votre disponibilité</div>
            <div style={{fontSize:12,color:"#7A6A5A",marginBottom:20}}>Indiquez quand vous êtes disponible pour une nouvelle mission ou un recrutement</div>

            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,color:"#5A4A3A",marginBottom:10}}>DISPONIBILITÉ ACTUELLE</div>
              <div style={{display:"flex",gap:10}}>
                {[[true,"✅ Disponible maintenant","Je peux commencer rapidement"],[false,"⏳ Disponible prochainement","J'ai une mission en cours"]].map(([v,l,d])=>(
                  <div key={String(v)} className={`choice-card ${form.disponible===v?"selected":""}`} style={{flex:1}} onClick={()=>set("disponible",v)}>
                    <div style={{fontWeight:700,fontSize:13,color:form.disponible===v?"#C8553D":"#F0EDE8",marginBottom:3}}>{l}</div>
                    <div style={{fontSize:11,color:"#7A6A5A"}}>{d}</div>
                  </div>
                ))}
              </div>
            </div>

            {!form.disponible && (
              <div style={{marginBottom:18}}>
                <div style={{fontSize:11,color:"#5A4A3A",marginBottom:6}}>DATE DE DISPONIBILITÉ</div>
                <input type="date" className="input" value={form.disponibleDate} onChange={e=>set("disponibleDate",e.target.value)} />
              </div>
            )}

            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,color:"#5A4A3A",marginBottom:10}}>MODE DE TRAVAIL</div>
              <div style={{display:"flex",gap:10}}>
                {[[true,"🏠 Remote","Travail à distance"],[false,"🏢 Sur site","Présence physique"],[null,"🔀 Flexible","Remote ou sur site"]].map(([v,l,d])=>(
                  <div key={String(v)} className={`choice-card ${form.remote===v?"selected":""}`} style={{flex:1}} onClick={()=>set("remote",v)}>
                    <div style={{fontWeight:700,fontSize:12,color:form.remote===v?"#C8553D":"#F0EDE8",textAlign:"center",marginBottom:2}}>{l}</div>
                    <div style={{fontSize:10,color:"#7A6A5A",textAlign:"center"}}>{d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:"#110D06",borderRadius:10,padding:16,border:"1px solid #2A1E12"}}>
              <div style={{fontSize:11,color:"#5A4A3A",marginBottom:10,fontWeight:700}}>RÉCAPITULATIF</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[[`${form.firstName} ${form.lastName}`,"Nom"],[form.email,"Email"],[form.domain,"Domaine"],[`${form.skills.length} compétence${form.skills.length>1?"s":""}`,""],[form.contractType==="freelance"?"Freelance":form.contractType==="cdi_maroc"?"CDI Maroc":"CDI France","Contrat"],[form.disponible?"Disponible":"Prochainement","Statut"]].map(([v,l],i)=>(
                  <div key={i} style={{background:"#1A1008",borderRadius:8,padding:"8px 10px"}}>
                    {l && <div style={{fontSize:10,color:"#5A4A3A",marginBottom:2}}>{l}</div>}
                    <div style={{fontSize:12,color:v?"#F0EDE8":"#3A2A18"}}>{v||"—"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{display:"flex",gap:12,marginTop:24}}>
          {step>0 && <button className="btn btn-ghost" style={{flex:1,justifyContent:"center"}} onClick={()=>setStep(s=>s-1)}>← Retour</button>}
          {step<4
            ? <button className="btn btn-accent" style={{flex:2,justifyContent:"center",padding:13}} onClick={()=>setStep(s=>s+1)} disabled={!canNext()}>Continuer →</button>
            : <button className="btn btn-accent" style={{flex:2,justifyContent:"center",padding:13}} onClick={handleSubmit}>✓ Soumettre mon profil</button>
          }
        </div>

        {step===0 && (
          <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"#3A2A18"}}>
            Déjà inscrit ? <span style={{color:"#C8553D",cursor:"pointer"}} onClick={async()=>{const p=await load("freelance-my-profile");if(p)setMyProfile(p);}}>Voir mon profil</span>
          </div>
        )}
      </div>
    </div>
  );
}
