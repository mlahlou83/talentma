import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ‚"Ä‚"Ä‚"Ä SCORING ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
const NOMS_TRES_FORTS = ["benali","chraibi","el fassi","idrissi","tazi","berrada","mansouri","ouazzani","kettani","bensouda","lahlou","alaoui","benkirane","fassi","benbrahim","benjelloun","tahiri","zniber","filali","bennani","bennis","skalli","sebti","mernissi"];
const NOMS_FORTS = ["bouazza","rahimi","ziani","amrani","belhaj","saidi","moussaoui","cherkaoui","bouzidi","hajji","kabbaj","naciri","belghiti","ouali","benomar","boussaid","fennich","ghazi","hamdouch","laabid","lamrani","mechbal","naji","benabdallah"];
const NOMS_MOYENS = ["hassan","mohamed","ahmed","ali","omar","youssef","khalil","rachid","hamid","mustapha","driss","nabil","karim","amine","mehdi","samir","tariq","bilal","soufiane","imane","ghita","hajar","salma","nadia","rania","loubna"];
const PRENOMS_MA = ["mohammed","mohamed","youssef","amine","mehdi","karim","hamid","rachid","nadia","imane","fatima","khadija","zineb","salma","yasmine","loubna","rania","ghita","hajar","meryem","ibrahim","ilyas","omar","bilal","soufiane","tariq","driss","mustapha"];
const KW_FREELANCE = ["freelance","ind√©pendant","independant","auto-entrepreneur","consultant ind√©pendant","freelancer","free-lance"];
const ECOLES_MAROC = ["mohammed v","um5","iscae","hec casablanca","hec rabat","emi","encg","esith","uir","hassan ii","cadi ayyad","inpt","ibn tofail","ensias","enset","abdelmalek","al akhawayn","aui","sidi mohamed","moulay ismail","enim"];
const EXP_MAROC = ["maroc","morocco","ocp","maroc telecom","attijariwafa","bmce","cih","banque populaire","wafa","oncf","royal air maroc","inwi","orange maroc","soci√©t√© g√©n√©rale maroc","casablanca","rabat","marrakech","f√®s","agadir","tanger","mekn√®s","oujda","cdg","hps"];

const DEFAULT_WEIGHTS = { nom_tres_fort: 40, nom_fort: 25, nom_moyen: 15, prenom: 10, ecole: 25, experience: 30 };

function scoreProfile(p, weights = DEFAULT_WEIGHTS) {
  const nom = (p.lastName || "").toLowerCase();
  const prenom = (p.firstName || "").toLowerCase();
  const ecoles = (p.education || "").toLowerCase();
  const exp = (p.experience || "").toLowerCase();
  let score = 0; let signals = [];
  if (NOMS_TRES_FORTS.some(n => nom.includes(n)))      { score += weights.nom_tres_fort; signals.push({ label: "Nom tr√®s fort", pts: weights.nom_tres_fort, color: "#2ECC71" }); }
  else if (NOMS_FORTS.some(n => nom.includes(n)))      { score += weights.nom_fort;      signals.push({ label: "Nom fort",      pts: weights.nom_fort,      color: "#F0B429" }); }
  else if (NOMS_MOYENS.some(n => nom.includes(n)))     { score += weights.nom_moyen;     signals.push({ label: "Nom moyen",     pts: weights.nom_moyen,     color: "#E8963D" }); }
  if (PRENOMS_MA.some(n => prenom.includes(n)))        { score += weights.prenom;        signals.push({ label: "Pr√©nom MA",     pts: weights.prenom,        color: "#5BAFD6" }); }
  if (ECOLES_MAROC.some(e => ecoles.includes(e)))      { score += weights.ecole;         signals.push({ label: "√âcole Maroc",   pts: weights.ecole,         color: "#2ECC71" }); }
  if (EXP_MAROC.some(e => exp.includes(e)))            { score += weights.experience;    signals.push({ label: "Exp. Maroc",    pts: weights.experience,    color: "#2ECC71" }); }
  const isFreelance = KW_FREELANCE.some(k => (p.headline||"").toLowerCase().includes(k));
  const hasMarocLink = ECOLES_MAROC.some(e => ecoles.includes(e)) || EXP_MAROC.some(e => exp.includes(e));
  const niveau = score >= 80 ? "üü¢ Tr√®s probable" : score >= 50 ? "üü° Probable" : score >= 25 ? "üü† Possible" : "ü"¥ Incertain";
  return { ...p, score, signals, isFreelance, hasMarocLink, niveau };
}

// ‚"Ä‚"Ä‚"Ä STORAGE ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
async function load(key) { try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; } }
async function save(key, val) { try { await window.storage.set(key, JSON.stringify(val)); } catch {} }

// ‚"Ä‚"Ä‚"Ä CONSTANTS ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
const PIPELINE_STAGES = [
  { id: "nouveau",    label: "Nouveau",     color: "#5BAFD6", bg: "#0A1A28" },
  { id: "contact√©",  label: "Contact√©",    color: "#7F77DD", bg: "#16123A" },
  { id: "rappeler",  label: "√Ä rappeler",  color: "#F0B429", bg: "#2D2000" },
  { id: "qualifi√©",  label: "Qualifi√©",    color: "#2ECC71", bg: "#0D3320" },
  { id: "pr√©sent√©",  label: "Pr√©sent√©",    color: "#0F6E56", bg: "#081A12" },
  { id: "plac√©",     label: "Plac√© ‚ú"",     color: "#C8553D", bg: "#2D1000" },
];
const CONTRACT = { freelance: { label: "Freelance", color: "#0F6E56", bg: "#0A2018" }, cdi_maroc: { label: "CDI Maroc", color: "#BA7517", bg: "#1E1400" }, cdi_france: { label: "CDI France", color: "#185FA5", bg: "#0A1420" } };
const DOMAINS = ["Tous","Dev","Design","Data","Marketing","Finance","Autre"];
const USERS = ["Mohamed","Coll√®gue"];

const SKILLS_BY_DOMAIN = {
  Dev:       ["React","Vue.js","Node.js","Laravel","Python","TypeScript","Flutter","React Native","AWS","Docker","WordPress","PHP"],
  Design:    ["Figma","Adobe XD","Illustrator","Photoshop","Motion Design","Branding","Webflow","UI/UX","Sketch"],
  Data:      ["Python","SQL","Power BI","Tableau","Machine Learning","R","Pandas","Excel","NLP","BigQuery"],
  Marketing: ["SEO","Google Ads","Facebook Ads","CRM","Copywriting","LinkedIn Ads","Analytics","Email Marketing"],
  Finance:   ["Excel","Sage","Comptabilit√©","Fiscalit√©","Audit","Contr√¥le de gestion","SAP"],
  Autre:     [],
};

const SAMPLE = [
  { id:1, firstName:"Karim",   lastName:"Ouazzani",  headline:"Dev Full Stack Freelance | React ¬∑ Node.js", location:"Paris, France",    education:"Universit√© Mohammed V Rabat, ISCAE", experience:"Soci√©t√© G√©n√©rale Maroc, Capgemini", phone:"+33612345678", email:"k.ouazzani@email.com", linkedinUrl:"https://linkedin.com/in/kouazzani", contractType:"freelance", domain:"Dev", skills:["React","Node.js","TypeScript","AWS"], disponible:true, screened:true, screeningNote:"Excellent profil. React avanc√©. Recommand√©.", marche:"france", pipelineStage:"qualifi√©", assignedTo:"Mohamed", callHistory:[], notes:[], rappelDate:"", scoreOverride:null },
  { id:2, firstName:"Yasmine", lastName:"Benali",    headline:"UX Designer Ind√©pendante | Figma",           location:"Lyon, France",     education:"ISCAE Casablanca, √âcole Nantes",     experience:"Orange Maroc, Agence DDB Lyon",   phone:"+33698765432", email:"y.benali@gmail.com",   linkedinUrl:"https://linkedin.com/in/ybenali",   contractType:"freelance", domain:"Design", skills:["Figma","Branding","Motion Design","UI/UX"], disponible:true, screened:true, screeningNote:"Portfolio solide. Recommand√©.", marche:"france", pipelineStage:"contact√©", assignedTo:"Mohamed", callHistory:[], notes:[], rappelDate:"", scoreOverride:null },
  { id:3, firstName:"Mehdi",   lastName:"Tazi",      headline:"Data Scientist ¬∑ Consultant ind√©pendant",    location:"Toulouse, France", education:"HEC Paris",                         experience:"OCP Maroc, BNP Paribas",           phone:"+33611223344", email:"m.tazi@outlook.com",   linkedinUrl:"https://linkedin.com/in/mehtazi",   contractType:"cdi_france", domain:"Data", skills:["Python","Machine Learning","SQL","NLP"], disponible:false, screened:true, screeningNote:"Profil senior. Visa talent en cours.", marche:"france", pipelineStage:"rappeler", assignedTo:"Coll√®gue", callHistory:[{ id:1, date:"2026-03-20T10:30:00Z", duration:145, result:"rappeler", notes:"Int√©ress√© CDI France. Rappeler vendredi.", user:"Coll√®gue" }], notes:[{ id:1, date:"2026-03-20T10:45:00Z", text:"Visa en cours de renouvellement ‚Ä" pr√©voir 2 mois.", user:"Coll√®gue" }], rappelDate:"2026-03-28", scoreOverride:null },
  { id:4, firstName:"Amine",   lastName:"Berrada",   headline:"Dev Mobile React Native ¬∑ Freelancer",       location:"Casablanca, Maroc",education:"EMI Rabat",                         experience:"HPS Maroc, OCP Digital",          phone:"+212661234567", email:"a.berrada@dev.ma",     linkedinUrl:"https://linkedin.com/in/aberrada",  contractType:"freelance", domain:"Dev", skills:["React Native","Flutter","TypeScript"], disponible:true, screened:false, screeningNote:"", marche:"maroc", pipelineStage:"nouveau", assignedTo:"Mohamed", callHistory:[], notes:[], rappelDate:"", scoreOverride:null },
  { id:5, firstName:"Rania",   lastName:"Kettani",   headline:"Data Analyst | Power BI ¬∑ SQL",              location:"Rabat, Maroc",     education:"ISCAE Casablanca, ESSEC Paris",     experience:"Attijariwafa Bank, McKinsey",      phone:"+212662345678", email:"r.kettani@ma",         linkedinUrl:"https://linkedin.com/in/rkettani",  contractType:"cdi_maroc", domain:"Data", skills:["Power BI","SQL","Excel","Tableau"], disponible:true, screened:true, screeningNote:"Profil exceptionnel. Double culture.", marche:"maroc", pipelineStage:"plac√©", assignedTo:"Mohamed", callHistory:[{ id:1, date:"2026-03-18T14:00:00Z", duration:210, result:"qualifi√©", notes:"Tr√®s motiv√©e. Disponible imm√©diatement.", user:"Mohamed" }], notes:[], rappelDate:"", scoreOverride:null },
];

// ‚"Ä‚"Ä‚"Ä CSS ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0D0A06;color:#F0EDE8;font-family:'Syne',sans-serif}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#110D06}::-webkit-scrollbar-thumb{background:#3A2A18;border-radius:2px}
.btn{cursor:pointer;border:none;border-radius:8px;font-family:'Syne',sans-serif;font-weight:600;transition:all .15s}
.btn-accent{background:#C8553D;color:#fff;padding:9px 18px;font-size:13px}.btn-accent:hover{background:#E06040}
.btn-ghost{background:transparent;color:#7A6A5A;padding:7px 13px;font-size:12px;border:1px solid #2A1E12}.btn-ghost:hover{border-color:#C8553D;color:#C8553D}
.btn-teal{background:#0F6E56;color:#fff;padding:9px 18px;font-size:13px}.btn-teal:hover{background:#1A9070}
.btn-sm{padding:5px 10px!important;font-size:11px!important}
.card{background:#1A1008;border:1px solid #2A1E12;border-radius:12px}
.input{background:#110D06;border:1px solid #2A1E12;border-radius:8px;padding:9px 13px;color:#F0EDE8;font-family:'Syne',sans-serif;font-size:13px;outline:none;width:100%}
.input:focus{border-color:#C8553D}
textarea.input{resize:vertical;min-height:72px}
select.input{cursor:pointer;appearance:none}
.tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:4px;font-size:10px;font-family:'JetBrains Mono';font-weight:500}
.slide-in{animation:si .2s ease}@keyframes si{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.ring{animation:rg 2s ease infinite}@keyframes rg{0%,100%{transform:scale(1)}15%{transform:scale(1.06)}30%{transform:scale(.97)}}
.pulse{animation:pl 1.4s ease-in-out infinite}@keyframes pl{0%,100%{opacity:1}50%{opacity:.4}}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}
.modal{background:#1A1008;border:1px solid #3A2A18;border-radius:14px;padding:22px;width:100%;max-width:500px;max-height:92vh;overflow-y:auto}
.nav-tab{padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;border:1px solid transparent;transition:all .15s;white-space:nowrap}
.nav-tab.active{background:#C8553D;color:#fff;border-color:#C8553D}
.nav-tab:not(.active){color:#7A6A5A;border-color:#2A1E12}.nav-tab:not(.active):hover{border-color:#C8553D;color:#C8553D}
.notif-dot{position:absolute;top:-3px;right:-3px;width:8px;height:8px;background:#E74C3C;border-radius:50%}
.kanban-col{flex:0 0 200px;min-width:200px}
.drag-over{border:1px dashed #C8553D!important;background:#2D1000!important}
`;

// ‚"Ä‚"Ä‚"Ä HELPERS ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
const fmtDate = d => d ? new Date(d).toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", year:"2-digit" }) : "";
const fmtTime = d => d ? new Date(d).toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" }) : "";
const fmtDur = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const isOverdue = p => p.rappelDate && p.pipelineStage === "rappeler" && new Date(p.rappelDate) < new Date();
const buildCSV = (profiles) => {
  const headers = ["Pr√©nom","Nom","Titre","Localisation","Contrat","March√©","Domaine","Score","Dispo","Certifi√©","Pipeline","Assign√©","Email","T√©l","LinkedIn"];
  const rows = profiles.map(p => [p.firstName,p.lastName,p.headline,p.location,CONTRACT[p.contractType]?.label,p.marche,p.domain,p.scoreOverride??p.score,p.disponible?"Oui":"Non",p.screened?"Oui":"Non",p.pipelineStage,p.assignedTo,p.email,p.phone,p.linkedinUrl].map(v => `"${(v||"").toString().replace(/"/g,'""')}"`).join(","));
  return [headers.join(","), ...rows].join("\n");
};

// ‚"Ä‚"Ä‚"Ä SMALL COMPONENTS ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
function ScoreBadge({ score, niveau }) {
  const c = niveau?.includes("Tr√®s") ? "#2ECC71" : niveau?.includes("Probable") ? "#F0B429" : niveau?.includes("Possible") ? "#E8963D" : "#E74C3C";
  const bg = niveau?.includes("Tr√®s") ? "#0D3320" : niveau?.includes("Probable") ? "#2D2000" : niveau?.includes("Possible") ? "#2D1500" : "#2D0D0D";
  return <span className="tag" style={{ background:bg, color:c, border:`1px solid ${c}40` }}>{score}pts</span>;
}

function StageBadge({ stage, stages = PIPELINE_STAGES }) {
  const s = stages.find(s => s.id === stage) || PIPELINE_STAGES[0];
  return <span className="tag" style={{ background:s.bg, color:s.color, border:`1px solid ${s.color}40` }}>{s.label}</span>;
}

// ‚"Ä‚"Ä‚"Ä CALL MODAL ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
function CallModal({ profile, currentUser, onClose, onSave }) {
  const [phase, setPhase] = useState("pre");
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState(null);
  const [notes, setNotes] = useState("");
  const [rappelDate, setRappelDate] = useState(profile.rappelDate || "");
  const timer = useRef(null);

  const startCall = () => {
    setPhase("calling"); setSeconds(0);
    timer.current = setInterval(() => setSeconds(s => s + 1), 1000);
    if (profile.phone) window.open(`https://wa.me/${profile.phone.replace(/\D/g,"")}`, "_blank");
  };
  const endCall = () => {
    clearInterval(timer.current);
    setResult(seconds >= 60 ? "qualifi√©" : seconds >= 15 ? "rappeler" : "contact√©");
    setPhase("post");
  };
  useEffect(() => () => clearInterval(timer.current), []);

  const handleSave = () => {
    const callEntry = { id: Date.now(), date: new Date().toISOString(), duration: seconds, result, notes, user: currentUser };
    const newStage = result === "qualifi√©" ? "qualifi√©" : result === "rappeler" ? "rappeler" : "contact√©";
    onSave({ callEntry, newStage, rappelDate, notes });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal slide-in" onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div><div style={{ fontWeight:800, fontSize:16 }}>{profile.firstName} {profile.lastName}</div><div style={{ fontSize:11, color:"#7A6A5A" }}>{profile.headline}</div></div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>‚úï</button>
        </div>

        {phase === "pre" && (
          <div>
            <div style={{ background:"#110D06", borderRadius:10, padding:14, marginBottom:16 }}>
              <div style={{ fontSize:13, color: profile.phone ? "#F0EDE8" : "#3A2A18", marginBottom:4 }}>ü"± {profile.phone || "Aucun num√©ro"}</div>
              <div style={{ fontSize:12, color:"#5BAFD6" }}>ü"ß {profile.email || "‚Ä""}</div>
            </div>
            <button className="btn" style={{ width:"100%", padding:13, fontSize:14, background:"#25D366", color:"#fff", justifyContent:"center", display:"flex", gap:8, alignItems:"center", opacity: profile.phone ? 1 : 0.4, cursor: profile.phone ? "pointer" : "not-allowed" }}
              onClick={startCall} disabled={!profile.phone}>
              <span style={{ fontSize:20 }}>ü"û</span> {profile.phone ? "Lancer l'appel WhatsApp" : "Num√©ro manquant"}
            </button>
          </div>
        )}

        {phase === "calling" && (
          <div style={{ textAlign:"center" }}>
            <div className="ring" style={{ width:72, height:72, borderRadius:"50%", background:"#25D36620", border:"2px solid #25D366", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>ü"û</div>
            <div style={{ fontFamily:"'JetBrains Mono'", fontSize:42, fontWeight:500, color:"#25D366", marginBottom:4 }}>{fmtDur(seconds)}</div>
            <div className="pulse" style={{ fontSize:11, color:"#7A6A5A", marginBottom:16 }}>Appel en cours‚Ä¶</div>
            <div style={{ fontSize:11, color:"#5A4A3A", background:"#110D06", padding:"6px 12px", borderRadius:6, marginBottom:20, display:"inline-block" }}>
              {seconds < 15 ? "< 15s ‚Ü' Contact√©" : seconds < 60 ? "15‚Ä"60s ‚Ü' Rappeler" : "> 60s ‚Ü' Qualifi√© ‚ú""}
            </div>
            <button className="btn btn-accent" style={{ width:"100%", padding:13 }} onClick={endCall}>Terminer l'appel</button>
          </div>
        )}

        {phase === "post" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:12, background:"#110D06", borderRadius:10, padding:12, marginBottom:14 }}>
              <div style={{ fontFamily:"'JetBrains Mono'", fontSize:22, color:"#25D366" }}>{fmtDur(seconds)}</div>
              <div style={{ flex:1 }}><div style={{ fontSize:11, color:"#5A4A3A" }}>Dur√©e appel</div></div>
              <StageBadge stage={result} />
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:8 }}>R√âSULTAT ‚Ü' √âTAPE PIPELINE</div>
              <div style={{ display:"flex", gap:8 }}>
                {[["qualifi√©","‚úÖ Qualifi√©","#2ECC71","#0D3320"],["rappeler","ü"Ñ Rappeler","#F0B429","#2D2000"],["contact√©","ü"û Contact√©","#7F77DD","#16123A"]].map(([r,l,c,bg]) => (
                  <button key={r} onClick={() => setResult(r)} style={{ flex:1, padding:"8px 4px", borderRadius:8, border:`2px solid ${result===r?c:"#2A1E12"}`, background:result===r?bg:"#110D06", color:result===r?c:"#5A4A3A", cursor:"pointer", fontSize:10, fontWeight:700, fontFamily:"'Syne'" }}>{l}</button>
                ))}
              </div>
            </div>
            {result === "rappeler" && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:6 }}>DATE DE RAPPEL</div>
                <input type="date" className="input" value={rappelDate} onChange={e => setRappelDate(e.target.value)} />
              </div>
            )}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:6 }}>R√âSUM√â DE L'APPEL</div>
              <textarea className="input" placeholder="Points cl√©s, besoins, suite‚Ä¶" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <button className="btn btn-accent" style={{ width:"100%", padding:13 }} onClick={handleSave}>ü'æ Enregistrer</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ‚"Ä‚"Ä‚"Ä PROFILE DETAIL MODAL ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
function ProfileModal({ profile, currentUser, stages = PIPELINE_STAGES, users = USERS, onClose, onCall, onUpdate }) {
  const [tab, setTab] = useState("info");
  const [newNote, setNewNote] = useState("");
  const [editStage, setEditStage] = useState(profile.pipelineStage);
  const [editAssigned, setEditAssigned] = useState(profile.assignedTo);
  const [editRappel, setEditRappel] = useState(profile.rappelDate || "");
  const [editScore, setEditScore] = useState(profile.scoreOverride ?? profile.score);
  const ct = CONTRACT[profile.contractType] || CONTRACT.freelance;

  const addNote = () => {
    if (!newNote.trim()) return;
    const note = { id: Date.now(), date: new Date().toISOString(), text: newNote, user: currentUser };
    onUpdate({ ...profile, notes: [note, ...(profile.notes||[])] });
    setNewNote("");
  };

  const saveChanges = () => {
    onUpdate({ ...profile, pipelineStage: editStage, assignedTo: editAssigned, rappelDate: editRappel, scoreOverride: editScore !== profile.score ? editScore : null });
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal slide-in" onClick={e => e.stopPropagation()}>
        <div style={{ height:4, background:ct.color, borderRadius:4, marginBottom:18 }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:17 }}>{profile.firstName} {profile.lastName}</div>
            <div style={{ fontSize:12, color:"#7A6A5A", marginTop:2 }}>{profile.headline}</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:6 }}>
              <ScoreBadge score={editScore} niveau={profile.niveau} />
              <StageBadge stage={editStage} />
              {profile.screened && <span className="tag" style={{ background:"#0D3320", color:"#2ECC71", border:"1px solid #1A7A4340" }}>‚ú" Certifi√©</span>}
              {isOverdue(profile) && <span className="tag" style={{ background:"#2D0D0D", color:"#E74C3C", border:"1px solid #7A1E17" }}>‚ö†Ô∏è Rappel en retard</span>}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>‚úï</button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto" }}>
          {[["info","Infos"],["pipeline","Pipeline"],["history","Appels"],["notes","Notes"]].map(([t,l]) => (
            <button key={t} className={`nav-tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>{l}{t==="history" && profile.callHistory?.length > 0 ? ` (${profile.callHistory.length})` : ""}{t==="notes" && profile.notes?.length > 0 ? ` (${profile.notes.length})` : ""}</button>
          ))}
        </div>

        {/* INFO TAB */}
        {tab === "info" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
              {[["ü"ç Ville",profile.location],["ü'º Contrat",ct.label],["üåç March√©",profile.marche==="france"?"üá´üá∑ France":"üá≤üá¶ Maroc"],["‚ö° Dispo",profile.disponible?"‚úÖ Disponible":"‚ùå Occup√©"],["ü"± T√©l",profile.phone||"‚Ä""],["ü"ß Email",profile.email||"‚Ä""]].map(([l,v]) => (
                <div key={l} style={{ background:"#110D06", borderRadius:8, padding:"8px 10px" }}>
                  <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:2 }}>{l}</div>
                  <div style={{ fontSize:12 }}>{v}</div>
                </div>
              ))}
            </div>
            {profile.education && <div style={{ marginBottom:8 }}><div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>ü"ö Formation</div><div style={{ fontSize:12, color:"#D5BDAC", background:"#110D06", padding:"8px 10px", borderRadius:8 }}>{profile.education}</div></div>}
            {profile.experience && <div style={{ marginBottom:8 }}><div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>ü'º Exp√©riences</div><div style={{ fontSize:12, color:"#D5BDAC", background:"#110D06", padding:"8px 10px", borderRadius:8 }}>{profile.experience}</div></div>}
            {(profile.skills||[]).length > 0 && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:6 }}>ü"ß COMP√âTENCES</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {(profile.skills||[]).map(s => (
                    <span key={s} className="tag" style={{ background:"#1E1208", color:"#D5BDAC", border:"1px solid #3A2A18", fontSize:11, padding:"3px 10px" }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:6 }}>SCORE MANUEL (actuel: {editScore}pts)</div>
              <input type="range" min={0} max={105} step={5} value={editScore} onChange={e => setEditScore(Number(e.target.value))} style={{ width:"100%", accentColor:"#C8553D" }} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#5A4A3A", marginTop:3 }}><span>0</span><span style={{ color:"#C8553D", fontWeight:700 }}>{editScore}pts</span><span>105</span></div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:12 }}>
              <button className="btn" style={{ flex:1, background:"#25D366", color:"#fff", padding:10, fontSize:13 }} onClick={() => { onClose(); onCall(profile); }}>ü"û Appeler</button>
              {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ background:"#0077B5", color:"#fff", padding:"10px 16px", borderRadius:8, fontSize:12, fontWeight:700, textDecoration:"none", display:"flex", alignItems:"center" }}>in</a>}
              <button className="btn btn-teal btn-sm" style={{ padding:"10px 14px", fontSize:12 }} onClick={saveChanges}>Sauvegarder</button>
            </div>
          </div>
        )}

        {/* PIPELINE TAB */}
        {tab === "pipeline" && (
          <div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:8 }}>√âTAPE PIPELINE</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {stages.map(s => (
                  <button key={s.id} onClick={() => setEditStage(s.id)}
                    style={{ padding:"10px 14px", borderRadius:8, border:`2px solid ${editStage===s.id?s.color:"#2A1E12"}`, background:editStage===s.id?s.bg:"transparent", color:editStage===s.id?s.color:"#5A4A3A", cursor:"pointer", fontWeight:editStage===s.id?700:400, fontFamily:"'Syne'", fontSize:13, textAlign:"left" }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:6 }}>ASSIGN√â √Ä</div>
              <div style={{ display:"flex", gap:8 }}>
                {users.map(u => (
                  <button key={u} onClick={() => setEditAssigned(u)}
                    style={{ flex:1, padding:"8px 10px", borderRadius:8, border:`2px solid ${editAssigned===u?"#C8553D":"#2A1E12"}`, background:editAssigned===u?"#2D1000":"transparent", color:editAssigned===u?"#C8553D":"#5A4A3A", cursor:"pointer", fontFamily:"'Syne'", fontSize:12 }}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:6 }}>DATE DE RAPPEL</div>
              <input type="date" className="input" value={editRappel} onChange={e => setEditRappel(e.target.value)} />
            </div>
            <button className="btn btn-accent" style={{ width:"100%", padding:12 }} onClick={saveChanges}>‚ú" Sauvegarder</button>
          </div>
        )}

        {/* CALL HISTORY TAB */}
        {tab === "history" && (
          <div>
            {(!profile.callHistory || profile.callHistory.length === 0) ? (
              <div style={{ textAlign:"center", padding:"30px 0", color:"#5A4A3A" }}>Aucun appel enregistr√©</div>
            ) : profile.callHistory.map(c => (
              <div key={c.id} style={{ background:"#110D06", borderRadius:10, padding:12, marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontFamily:"'JetBrains Mono'", fontSize:13, color:"#25D366" }}>{fmtDur(c.duration)}</span>
                  <StageBadge stage={c.result} />
                  <span style={{ fontSize:11, color:"#5A4A3A" }}>{fmtDate(c.date)} {fmtTime(c.date)}</span>
                </div>
                <div style={{ fontSize:11, color:"#7A6A5A", marginBottom:4 }}>Par {c.user}</div>
                {c.notes && <div style={{ fontSize:12, color:"#D5BDAC", borderLeft:"2px solid #3A2A18", paddingLeft:8 }}>{c.notes}</div>}
              </div>
            ))}
          </div>
        )}

        {/* NOTES TAB */}
        {tab === "notes" && (
          <div>
            <div style={{ marginBottom:12 }}>
              <textarea className="input" placeholder="Ajouter une note‚Ä¶" value={newNote} onChange={e => setNewNote(e.target.value)} />
              <button className="btn btn-teal" style={{ width:"100%", marginTop:8, padding:10 }} onClick={addNote}>+ Ajouter la note</button>
            </div>
            {(!profile.notes || profile.notes.length === 0) ? (
              <div style={{ textAlign:"center", padding:"20px 0", color:"#5A4A3A" }}>Aucune note</div>
            ) : profile.notes.map(n => (
              <div key={n.id} style={{ background:"#110D06", borderRadius:10, padding:12, marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:11, color:"#C8553D", fontWeight:700 }}>{n.user}</span>
                  <span style={{ fontSize:11, color:"#5A4A3A" }}>{fmtDate(n.date)} {fmtTime(n.date)}</span>
                </div>
                <div style={{ fontSize:13, color:"#D5BDAC" }}>{n.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ‚"Ä‚"Ä‚"Ä KANBAN VIEW ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
function KanbanView({ profiles, stages = PIPELINE_STAGES, onCardClick, onDrop }) {
  const [dragId, setDragId] = useState(null);
  const [overStage, setOverStage] = useState(null);

  return (
    <div style={{ overflowX:"auto", paddingBottom:8 }}>
      <div style={{ display:"flex", gap:12, minWidth:"max-content" }}>
        {stages.map(stage => {
          const stageProfiles = profiles.filter(p => p.pipelineStage === stage.id);
          return (
            <div key={stage.id} className={`kanban-col ${overStage===stage.id?"drag-over":""}`}
              style={{ background:"#110D06", borderRadius:12, padding:10, border:`1px solid ${overStage===stage.id?"#C8553D":"#2A1E12"}` }}
              onDragOver={e => { e.preventDefault(); setOverStage(stage.id); }}
              onDragLeave={() => setOverStage(null)}
              onDrop={() => { if (dragId) { onDrop(dragId, stage.id); setDragId(null); setOverStage(null); } }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:11, fontWeight:700, color:stage.color }}>{stage.label}</span>
                <span style={{ fontSize:11, fontFamily:"'JetBrains Mono'", background:stage.bg, color:stage.color, padding:"2px 7px", borderRadius:10 }}>{stageProfiles.length}</span>
              </div>
              {stageProfiles.map(p => (
                <div key={p.id} draggable
                  onDragStart={() => setDragId(p.id)}
                  onDragEnd={() => { setDragId(null); setOverStage(null); }}
                  onClick={() => onCardClick(p)}
                  style={{ background:"#1A1008", border:`1px solid ${isOverdue(p)?"#E74C3C":"#2A1E12"}`, borderRadius:8, padding:"10px", marginBottom:8, cursor:"pointer", opacity:dragId===p.id?0.5:1, transition:"opacity .15s" }}>
                  <div style={{ fontWeight:700, fontSize:12, marginBottom:3 }}>{p.firstName} {p.lastName}</div>
                  <div style={{ fontSize:10, color:"#7A6A5A", marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.headline}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <ScoreBadge score={p.scoreOverride ?? p.score} niveau={p.niveau} />
                    {p.screened && <span style={{ fontSize:9, color:"#2ECC71" }}>‚ú"</span>}
                    {isOverdue(p) && <span style={{ fontSize:9, color:"#E74C3C" }}>‚ö†Ô∏è</span>}
                  </div>
                  <div style={{ fontSize:10, color:"#5A4A3A", marginTop:4 }}>ü'§ {p.assignedTo}</div>
                  {p.rappelDate && <div style={{ fontSize:10, color: isOverdue(p) ? "#E74C3C" : "#F0B429", marginTop:2 }}>ü"Ö {fmtDate(p.rappelDate)}</div>}
                </div>
              ))}
              {stageProfiles.length === 0 && <div style={{ fontSize:11, color:"#3A2A18", textAlign:"center", padding:"20px 0" }}>‚Ä"</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ‚"Ä‚"Ä‚"Ä SCORING CONFIG MODAL ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
function ScoringModal({ weights, onClose, onSave }) {
  const [w, setW] = useState({ ...weights });
  const setVal = (k, v) => setW(prev => ({ ...prev, [k]: Number(v) }));
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal slide-in" onClick={e => e.stopPropagation()} style={{ maxWidth:400 }}>
        <div style={{ fontWeight:800, fontSize:16, marginBottom:18 }}>‚öôÔ∏è Calibrer le scoring</div>
        {[["nom_tres_fort","Nom tr√®s fort (ex: Benali, Tazi‚Ä¶)"],["nom_fort","Nom fort (ex: Rahimi, Ziani‚Ä¶)"],["nom_moyen","Nom moyen (pr√©nom commun)"],["prenom","Pr√©nom marocain"],["ecole","√âcole marocaine d√©tect√©e"],["experience","Exp√©rience Maroc d√©tect√©e"]].map(([k, label]) => (
          <div key={k} style={{ marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
              <span style={{ color:"#7A6A5A" }}>{label}</span>
              <span style={{ fontFamily:"'JetBrains Mono'", color:"#C8553D", fontWeight:700 }}>+{w[k]}pts</span>
            </div>
            <input type="range" min={0} max={50} step={5} value={w[k]} onChange={e => setVal(k, e.target.value)} style={{ width:"100%", accentColor:"#C8553D" }} />
          </div>
        ))}
        <div style={{ background:"#110D06", borderRadius:8, padding:10, marginBottom:16, textAlign:"center", fontSize:12, color:"#7A6A5A" }}>
          Score max possible : <b style={{ color:"#C8553D" }}>{Object.values(w).reduce((a,b)=>a+b,0)}pts</b>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Annuler</button>
          <button className="btn btn-accent" style={{ flex:2 }} onClick={() => onSave(w)}>Appliquer</button>
        </div>
      </div>
    </div>
  );
}

// ‚"Ä‚"Ä‚"Ä SKILL FILTER DROPDOWN ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
function SkillFilter({ domain, selected, onToggle, onClear, skills = SKILLS_BY_DOMAIN }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const allSkills = (domain === "Tous"
    ? Object.values(skills).flat().filter((s,i,a) => a.indexOf(s)===i)
    : skills[domain] || []
  ).sort();

  const shown = search.trim()
    ? allSkills.filter(s => s.toLowerCase().includes(search.toLowerCase()))
    : allSkills;

  return (
    <div style={{ marginTop:10 }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ display:"flex", alignItems:"center", gap:8, background:"#110D06", border:`1px solid ${open || selected.length > 0 ? "#C8553D" : "#2A1E12"}`, borderRadius: open ? "8px 8px 0 0" : "8px", padding:"8px 12px", cursor:"pointer", userSelect:"none" }}>
        <span style={{ fontSize:12, color:"#5A4A3A" }}>ü"ß</span>
        <div style={{ flex:1, display:"flex", gap:5, flexWrap:"wrap", alignItems:"center", minHeight:20 }}>
          {selected.length === 0
            ? <span style={{ fontSize:12, color:"#5A4A3A" }}>Filtrer par comp√©tence‚Ä¶</span>
            : selected.map(s => (
                <span key={s} style={{ fontSize:11, padding:"2px 8px", borderRadius:4, background:"#C8553D20", color:"#C8553D", border:"1px solid #C8553D40", display:"inline-flex", alignItems:"center", gap:4 }}>
                  {s}
                  <span style={{ cursor:"pointer", fontWeight:800 }} onClick={e => { e.stopPropagation(); onToggle(s); }}>√ó</span>
                </span>
              ))
          }
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
          {selected.length > 0 && (
            <span style={{ fontSize:10, background:"#C8553D", color:"#fff", borderRadius:10, padding:"1px 7px", fontWeight:700, cursor:"pointer" }}
              onClick={e => { e.stopPropagation(); onClear(); }}>
              {selected.length} ‚úï
            </span>
          )}
          <span style={{ color:"#5A4A3A", fontSize:11 }}>{open ? "‚ñ¥" : "‚ñæ"}</span>
        </div>
      </div>
      {open && (
        <div style={{ background:"#110D06", border:"1px solid #2A1E12", borderTop:"none", borderRadius:"0 0 8px 8px", overflow:"hidden" }}>
          <div style={{ padding:"8px 10px", borderBottom:"1px solid #2A1E12" }}>
            <input className="input" style={{ fontSize:12, padding:"6px 10px" }}
              placeholder="Rechercher une comp√©tence‚Ä¶" value={search}
              onChange={e => setSearch(e.target.value)}
              onClick={e => e.stopPropagation()} />
          </div>
          <div style={{ maxHeight:200, overflowY:"auto" }}>
            {shown.length === 0
              ? <div style={{ padding:"12px", fontSize:12, color:"#5A4A3A", textAlign:"center" }}>Aucun r√©sultat</div>
              : shown.map(s => {
                  const checked = selected.includes(s);
                  return (
                    <div key={s} onClick={() => onToggle(s)}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", cursor:"pointer", background: checked ? "#2D100080" : "transparent", borderBottom:"1px solid #1A1208" }}>
                      <div style={{ width:15, height:15, borderRadius:3, border:`2px solid ${checked ? "#C8553D" : "#3A2A18"}`, background: checked ? "#C8553D" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {checked && <span style={{ color:"#fff", fontSize:9, fontWeight:800, lineHeight:1 }}>‚ú"</span>}
                      </div>
                      <span style={{ fontSize:13, color: checked ? "#F0EDE8" : "#7A6A5A" }}>{s}</span>
                    </div>
                  );
                })
            }
          </div>
          <div style={{ padding:"6px 12px", borderTop:"1px solid #2A1E12", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:10, color:"#5A4A3A" }}>{shown.length} comp√©tence{shown.length>1?"s":""}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => { setOpen(false); setSearch(""); }}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ‚"Ä‚"Ä‚"Ä SETTINGS VIEW ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
// ‚"Ä‚"Ä‚"Ä SETTINGS SCREEN ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
const PALETTE = ["#C8553D","#0F6E56","#185FA5","#BA7517","#7F77DD","#D4537E","#2ECC71","#E67E22","#9B59B6","#1ABC9C","#E74C3C","#5BAFD6"];

function SettingsView({ weights, onWeightsChange, domains, onDomainsChange, skills, onSkillsChange, users, onUsersChange, stages, onStagesChange, contracts, onContractsChange, march√©s, onMarch√©sChange }) {
  const [activeSection, setActiveSection] = useState("scoring");
  const [saved, setSaved] = useState(false);
  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const SECTIONS = [
    { id:"scoring",    icon:"ü"ä", label:"Scoring" },
    { id:"domains",    icon:"üóÇÔ∏è", label:"Domaines" },
    { id:"skills",     icon:"ü"ß", label:"Comp√©tences" },
    { id:"pipeline",   icon:"ü"Ñ", label:"Pipeline" },
    { id:"contracts",  icon:"ü"ã", label:"Contrats" },
    { id:"marches",    icon:"üåç", label:"March√©s" },
    { id:"users",      icon:"ü'•", label:"Utilisateurs" },
  ];

  return (
    <div className="slide-in" style={{ display:"flex", gap:0, minHeight:500 }}>

      {/* Sidebar */}
      <div style={{ width:140, flexShrink:0, borderRight:"1px solid #2A1E12", paddingRight:12, marginRight:16 }}>
        <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:10, fontWeight:700, letterSpacing:"0.8px" }}>PARAM√àTRES</div>
        {SECTIONS.map(s => (
          <div key={s.id} onClick={() => setActiveSection(s.id)}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 10px", borderRadius:8, cursor:"pointer", marginBottom:3, background: activeSection===s.id ? "#C8553D15" : "transparent", border: `1px solid ${activeSection===s.id ? "#C8553D40" : "transparent"}`, transition:"all .15s" }}>
            <span style={{ fontSize:14 }}>{s.icon}</span>
            <span style={{ fontSize:12, fontWeight: activeSection===s.id ? 700 : 400, color: activeSection===s.id ? "#C8553D" : "#7A6A5A" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        {saved && (
          <div style={{ background:"#0D3320", border:"1px solid #1A7A43", borderRadius:8, padding:"8px 14px", marginBottom:14, fontSize:12, color:"#2ECC71", display:"flex", alignItems:"center", gap:8 }}>
            <span>‚ú"</span> Modifications sauvegard√©es
          </div>
        )}

        {/* ‚"Ä‚"Ä SCORING */}
        {activeSection === "scoring" && <ScoringSection weights={weights} onSave={async w => { await onWeightsChange(w); flash(); }} />}

        {/* ‚"Ä‚"Ä DOMAINES */}
        {activeSection === "domains" && <DomainsSection domains={domains} skills={skills} onSave={async (d,s) => { await onDomainsChange(d); await onSkillsChange(s); flash(); }} />}

        {/* ‚"Ä‚"Ä COMP√âTENCES */}
        {activeSection === "skills" && <SkillsSection domains={domains} skills={skills} onSave={async s => { await onSkillsChange(s); flash(); }} />}

        {/* ‚"Ä‚"Ä PIPELINE */}
        {activeSection === "pipeline" && <PipelineSection stages={stages} onSave={async s => { await onStagesChange(s); flash(); }} />}

        {/* ‚"Ä‚"Ä CONTRATS */}
        {activeSection === "contracts" && <ContractsSection contracts={contracts} onSave={async c => { await onContractsChange(c); flash(); }} />}

        {/* ‚"Ä‚"Ä MARCH√âS */}
        {activeSection === "marches" && <March√©sSection march√©s={march√©s} onSave={async m => { await onMarch√©sChange(m); flash(); }} />}

        {/* ‚"Ä‚"Ä UTILISATEURS */}
        {activeSection === "users" && <UsersSection users={users} onSave={async u => { await onUsersChange(u); flash(); }} />}
      </div>
    </div>
  );
}

// ‚"Ä‚"Ä Scoring section
function ScoringSection({ weights, onSave }) {
  const [w, setW] = useState({ ...weights });
  const criteria = [
    { key:"nom_tres_fort", label:"Nom tr√®s fort", desc:"Benali, Tazi, Chraibi, Idrissi‚Ä¶", max:50 },
    { key:"nom_fort",      label:"Nom fort",      desc:"Rahimi, Ziani, Bouazza‚Ä¶",          max:40 },
    { key:"nom_moyen",     label:"Nom moyen",     desc:"Pr√©nom arabe commun",              max:30 },
    { key:"prenom",        label:"Pr√©nom marocain", desc:"Mohamed, Yasmine, Mehdi‚Ä¶",       max:20 },
    { key:"ecole",         label:"√âcole marocaine", desc:"UM5, ISCAE, EMI, Al Akhawayn‚Ä¶", max:40 },
    { key:"experience",    label:"Exp√©rience Maroc", desc:"Ville ou entreprise marocaine", max:40 },
  ];
  return (
    <div>
      <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Pond√©rations du scoring</div>
      <div style={{ fontSize:12, color:"#5A4A3A", marginBottom:18 }}>D√©finit l'importance de chaque signal de d√©tection de l'origine marocaine.</div>
      {criteria.map(c => (
        <div key={c.key} style={{ background:"#110D06", borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700 }}>{c.label}</div>
              <div style={{ fontSize:11, color:"#5A4A3A" }}>{c.desc}</div>
            </div>
            <div style={{ fontFamily:"'JetBrains Mono'", fontSize:22, fontWeight:700, color:"#C8553D", minWidth:60, textAlign:"right" }}>+{w[c.key]}</div>
          </div>
          <input type="range" min={0} max={c.max} step={5} value={w[c.key]}
            onChange={e => setW(prev => ({ ...prev, [c.key]: Number(e.target.value) }))}
            style={{ width:"100%", accentColor:"#C8553D" }} />
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"#3A2A18", marginTop:2 }}>
            <span>0 (d√©sactiv√©)</span><span>Max {c.max}pts</span>
          </div>
        </div>
      ))}
      <div style={{ background:"#1E1208", borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12, color:"#7A6A5A" }}>Score maximum possible</span>
        <span style={{ fontSize:20, fontWeight:800, color:"#C8553D", fontFamily:"'JetBrains Mono'" }}>{Object.values(w).reduce((a,b)=>a+b,0)} pts</span>
      </div>
      <button className="btn btn-accent" style={{ width:"100%", padding:12 }} onClick={() => onSave(w)}>ü'æ Sauvegarder le scoring</button>
    </div>
  );
}

// ‚"Ä‚"Ä Domains section
function DomainsSection({ domains, skills, onSave }) {
  const [list, setList] = useState([...domains]);
  const [input, setInput] = useState("");
  const add = () => { const v = input.trim(); if (v && !list.includes(v)) { setList(l => [...l, v]); setInput(""); } };
  const remove = (d) => setList(l => l.filter(x => x !== d));
  return (
    <div>
      <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Domaines d'activit√©</div>
      <div style={{ fontSize:12, color:"#5A4A3A", marginBottom:18 }}>Les domaines regroupent les comp√©tences et permettent de filtrer les profils.</div>
      <div style={{ marginBottom:14 }}>
        {list.map(d => (
          <div key={d} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"#110D06", borderRadius:8, marginBottom:6, border:"1px solid #2A1E12" }}>
            <span style={{ flex:1, fontSize:13 }}>{d}</span>
            <span style={{ fontSize:11, color:"#5A4A3A", fontFamily:"'JetBrains Mono'" }}>{(skills[d]||[]).length} comp√©tences</span>
            {list.length > 1 && (
              <button className="btn btn-ghost btn-sm" style={{ color:"#E74C3C", borderColor:"#7A1E17" }} onClick={() => remove(d)}>Supprimer</button>
            )}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <input className="input" placeholder="Nouveau domaine (ex: RH, Juridique‚Ä¶)" value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && add()} />
        <button className="btn btn-teal" style={{ flexShrink:0 }} onClick={add}>+ Ajouter</button>
      </div>
      <button className="btn btn-accent" style={{ width:"100%", padding:12 }} onClick={() => onSave(list, skills)}>ü'æ Sauvegarder</button>
    </div>
  );
}

// ‚"Ä‚"Ä Skills section
function SkillsSection({ domains, skills, onSave }) {
  const [localSkills, setLocalSkills] = useState(JSON.parse(JSON.stringify(skills)));
  const [domain, setDomain] = useState(domains[0] || "");
  const [input, setInput] = useState("");

  const current = localSkills[domain] || [];
  const addSkill = () => { const v = input.trim(); if (!v || current.includes(v)) return; setLocalSkills(s => ({ ...s, [domain]: [...(s[domain]||[]), v] })); setInput(""); };
  const removeSkill = (sk) => setLocalSkills(s => ({ ...s, [domain]: (s[domain]||[]).filter(x => x !== sk) }));

  return (
    <div>
      <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Comp√©tences par domaine</div>
      <div style={{ fontSize:12, color:"#5A4A3A", marginBottom:16 }}>S√©lectionne un domaine puis g√®re ses comp√©tences.</div>

      {/* Domain tabs */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
        {domains.map(d => (
          <button key={d} onClick={() => { setDomain(d); setInput(""); }}
            className="btn btn-ghost btn-sm"
            style={{ borderColor: domain===d ? "#C8553D" : "#2A1E12", color: domain===d ? "#C8553D" : "#7A6A5A", background: domain===d ? "#C8553D15" : "transparent" }}>
            {d} <span style={{ fontFamily:"'JetBrains Mono'", fontSize:10 }}>({(localSkills[d]||[]).length})</span>
          </button>
        ))}
      </div>

      {/* Skills list */}
      <div style={{ background:"#110D06", borderRadius:10, padding:14, marginBottom:14, minHeight:120 }}>
        {current.length === 0
          ? <div style={{ fontSize:12, color:"#3A2A18", textAlign:"center", padding:"20px 0" }}>Aucune comp√©tence ‚Ä" ajoutes-en ci-dessous</div>
          : <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {current.map(sk => (
                <span key={sk} style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, padding:"4px 12px", borderRadius:6, background:"#1E1208", color:"#D5BDAC", border:"1px solid #2A1E12" }}>
                  {sk}
                  <span style={{ cursor:"pointer", color:"#E74C3C", fontWeight:800, fontSize:13 }} onClick={() => removeSkill(sk)}>√ó</span>
                </span>
              ))}
            </div>
        }
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <input className="input" placeholder={`Nouvelle comp√©tence pour ${domain}‚Ä¶`} value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && addSkill()} />
        <button className="btn btn-teal" style={{ flexShrink:0 }} onClick={addSkill}>+ Ajouter</button>
      </div>
      <button className="btn btn-accent" style={{ width:"100%", padding:12 }} onClick={() => onSave(localSkills)}>ü'æ Sauvegarder les comp√©tences</button>
    </div>
  );
}

// ‚"Ä‚"Ä Pipeline section
function PipelineSection({ stages, onSave }) {
  const [list, setList] = useState([...stages]);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#7F77DD");

  const moveUp   = (i) => { if (i===0) return; const l=[...list]; [l[i-1],l[i]]=[l[i],l[i-1]]; setList(l); };
  const moveDown = (i) => { if (i===list.length-1) return; const l=[...list]; [l[i],l[i+1]]=[l[i+1],l[i]]; setList(l); };
  const remove   = (i) => { if (list.length <= 2) return; setList(l => l.filter((_,j)=>j!==i)); };
  const add = () => {
    if (!newLabel.trim()) return;
    const id = newLabel.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
    setList(l => [...l, { id, label:newLabel.trim(), color:newColor, bg:newColor+"20" }]);
    setNewLabel("");
  };

  return (
    <div>
      <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>√âtapes du pipeline</div>
      <div style={{ fontSize:12, color:"#5A4A3A", marginBottom:18 }}>D√©finit le parcours de qualification d'un profil. Minimum 2 √©tapes. R√©organise par ordre de progression.</div>

      {list.map((s, i) => (
        <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#110D06", borderRadius:8, marginBottom:6, border:`1px solid ${s.color}30` }}>
          <div style={{ width:14, height:14, borderRadius:3, background:s.color, flexShrink:0 }} />
          <span style={{ flex:1, fontSize:13, fontWeight:600, color:"#F0EDE8" }}>{s.label}</span>
          <div style={{ display:"flex", gap:4 }}>
            <button className="btn btn-ghost btn-sm" style={{ padding:"3px 7px" }} onClick={() => moveUp(i)}>‚Ü'</button>
            <button className="btn btn-ghost btn-sm" style={{ padding:"3px 7px" }} onClick={() => moveDown(i)}>‚Ü"</button>
            {list.length > 2 && <button className="btn btn-ghost btn-sm" style={{ color:"#E74C3C", borderColor:"#7A1E17", padding:"3px 8px" }} onClick={() => remove(i)}>√ó</button>}
          </div>
        </div>
      ))}

      <div style={{ background:"#110D06", borderRadius:10, padding:14, marginTop:14, marginBottom:16, border:"1px solid #2A1E12" }}>
        <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:10, fontWeight:700 }}>NOUVELLE √âTAPE</div>
        <input className="input" placeholder="Nom de l'√©tape‚Ä¶" value={newLabel}
          onChange={e => setNewLabel(e.target.value)} onKeyDown={e => e.key==="Enter" && add()} style={{ marginBottom:10 }} />
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
          {PALETTE.map(c => (
            <div key={c} onClick={() => setNewColor(c)}
              style={{ width:24, height:24, borderRadius:6, background:c, cursor:"pointer", border: newColor===c ? "3px solid #fff" : "3px solid transparent", transition:"border .1s" }} />
          ))}
        </div>
        <button className="btn btn-teal" style={{ width:"100%" }} onClick={add}>+ Ajouter l'√©tape</button>
      </div>
      <button className="btn btn-accent" style={{ width:"100%", padding:12 }} onClick={() => onSave(list)}>ü'æ Sauvegarder le pipeline</button>
    </div>
  );
}

// ‚"Ä‚"Ä Contracts section
function ContractsSection({ contracts, onSave }) {
  const [list, setList] = useState([...contracts]);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#0F6E56");
  const remove = (i) => { if (list.length <= 1) return; setList(l => l.filter((_,j)=>j!==i)); };
  const add = () => {
    if (!newLabel.trim()) return;
    const id = newLabel.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
    setList(l => [...l, { id, label:newLabel.trim(), color:newColor, bg:newColor+"20" }]);
    setNewLabel("");
  };
  return (
    <div>
      <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Types de contrat</div>
      <div style={{ fontSize:12, color:"#5A4A3A", marginBottom:18 }}>Les types de contrat qualifient la relation entre le talent et le client.</div>

      {list.map((c, i) => (
        <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#110D06", borderRadius:8, marginBottom:6, border:`1px solid ${c.color}30` }}>
          <div style={{ width:14, height:14, borderRadius:3, background:c.color, flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600 }}>{c.label}</div>
            <div style={{ fontSize:10, color:"#5A4A3A", fontFamily:"'JetBrains Mono'" }}>id: {c.id}</div>
          </div>
          {list.length > 1 && <button className="btn btn-ghost btn-sm" style={{ color:"#E74C3C", borderColor:"#7A1E17" }} onClick={() => remove(i)}>Supprimer</button>}
        </div>
      ))}

      <div style={{ background:"#110D06", borderRadius:10, padding:14, marginTop:14, marginBottom:16, border:"1px solid #2A1E12" }}>
        <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:10, fontWeight:700 }}>NOUVEAU TYPE</div>
        <input className="input" placeholder="Ex: Portage salarial, Stage‚Ä¶" value={newLabel}
          onChange={e => setNewLabel(e.target.value)} onKeyDown={e => e.key==="Enter" && add()} style={{ marginBottom:10 }} />
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
          {PALETTE.map(c => (
            <div key={c} onClick={() => setNewColor(c)}
              style={{ width:24, height:24, borderRadius:6, background:c, cursor:"pointer", border: newColor===c ? "3px solid #fff" : "3px solid transparent" }} />
          ))}
        </div>
        <button className="btn btn-teal" style={{ width:"100%" }} onClick={add}>+ Ajouter</button>
      </div>
      <button className="btn btn-accent" style={{ width:"100%", padding:12 }} onClick={() => onSave(list)}>ü'æ Sauvegarder</button>
    </div>
  );
}

// ‚"Ä‚"Ä March√©s section
function March√©sSection({ march√©s, onSave }) {
  const [list, setList] = useState([...march√©s]);
  const [newLabel, setNewLabel] = useState("");
  const [newFlag, setNewFlag] = useState("");
  const remove = (i) => { if (list.length <= 1) return; setList(l => l.filter((_,j)=>j!==i)); };
  const add = () => {
    if (!newLabel.trim()) return;
    const id = newLabel.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
    setList(l => [...l, { id, label:`${newFlag} ${newLabel}`.trim(), flag:newFlag }]);
    setNewLabel(""); setNewFlag("");
  };
  return (
    <div>
      <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>March√©s g√©ographiques</div>
      <div style={{ fontSize:12, color:"#5A4A3A", marginBottom:18 }}>D√©finit les pays ou zones g√©ographiques cibles pour les clients et les talents.</div>

      {list.map((m, i) => (
        <div key={m.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"#110D06", borderRadius:8, marginBottom:6, border:"1px solid #2A1E12" }}>
          <span style={{ fontSize:20 }}>{m.flag}</span>
          <span style={{ flex:1, fontSize:13, fontWeight:600 }}>{m.label}</span>
          {list.length > 1 && <button className="btn btn-ghost btn-sm" style={{ color:"#E74C3C", borderColor:"#7A1E17" }} onClick={() => remove(i)}>Supprimer</button>}
        </div>
      ))}

      <div style={{ background:"#110D06", borderRadius:10, padding:14, marginTop:14, marginBottom:16, border:"1px solid #2A1E12" }}>
        <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:10, fontWeight:700 }}>NOUVEAU MARCH√â</div>
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          <input className="input" style={{ maxWidth:70, fontSize:20, textAlign:"center" }} placeholder="üá©üá™" value={newFlag} onChange={e => setNewFlag(e.target.value)} />
          <input className="input" placeholder="Nom du march√© (ex: Allemagne)" value={newLabel}
            onChange={e => setNewLabel(e.target.value)} onKeyDown={e => e.key==="Enter" && add()} />
        </div>
        <button className="btn btn-teal" style={{ width:"100%" }} onClick={add}>+ Ajouter le march√©</button>
      </div>
      <button className="btn btn-accent" style={{ width:"100%", padding:12 }} onClick={() => onSave(list)}>ü'æ Sauvegarder</button>
    </div>
  );
}

// ‚"Ä‚"Ä Users section
function UsersSection({ users, onSave }) {
  const [list, setList] = useState([...users]);
  const [input, setInput] = useState("");
  const add = () => { const v = input.trim(); if (v && !list.includes(v)) { setList(l => [...l, v]); setInput(""); } };
  const remove = (u) => { if (list.length <= 1) return; setList(l => l.filter(x => x !== u)); };
  return (
    <div>
      <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Utilisateurs</div>
      <div style={{ fontSize:12, color:"#5A4A3A", marginBottom:18 }}>Les utilisateurs apparaissent dans le switcher de la nav et peuvent √™tre assign√©s aux profils et aux appels.</div>

      {list.map((u, i) => (
        <div key={u} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"#110D06", borderRadius:8, marginBottom:6, border:"1px solid #2A1E12" }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"#C8553D20", border:"1px solid #C8553D40", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#C8553D" }}>
            {u[0]?.toUpperCase()}
          </div>
          <span style={{ flex:1, fontSize:13, fontWeight:600 }}>{u}</span>
          {list.length > 1
            ? <button className="btn btn-ghost btn-sm" style={{ color:"#E74C3C", borderColor:"#7A1E17" }} onClick={() => remove(u)}>Supprimer</button>
            : <span style={{ fontSize:11, color:"#5A4A3A" }}>Requis</span>
          }
        </div>
      ))}

      <div style={{ display:"flex", gap:8, marginTop:14, marginBottom:16 }}>
        <input className="input" placeholder="Nom du collaborateur‚Ä¶" value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && add()} />
        <button className="btn btn-teal" style={{ flexShrink:0 }} onClick={add}>+ Ajouter</button>
      </div>
      <button className="btn btn-accent" style={{ width:"100%", padding:12 }} onClick={() => onSave(list)}>ü'æ Sauvegarder</button>
    </div>
  );
}

// ‚"Ä‚"Ä‚"Ä LOGIN SCREEN ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
function LoginScreen({ onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) { setError("Remplis tous les champs."); return; }
    setLoading(true);
    const users = await load("tm-v3-admin-users") || [
      { username: "Mohamed", password: "talentma2026", role: "admin" },
      { username: "Coll√®gue", password: "talent123",   role: "user" },
    ];
    const found = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password);
    if (found) {
      await save("tm-v3-session", { username: found.username, role: found.role, loginAt: new Date().toISOString() });
      onLogin(found);
    } else {
      setError("Identifiants incorrects.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0D0A06", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <style>{css}</style>
      <div style={{ width:"100%", maxWidth:380 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>üá≤üá¶</div>
          <div style={{ fontSize:26, fontWeight:800, fontFamily:"'Syne',sans-serif" }}>TalentMA</div>
          <div style={{ fontSize:11, color:"#5A4A3A", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"2px", marginTop:4 }}>ESPACE ADMINISTRATION</div>
        </div>

        {/* Card */}
        <div style={{ background:"#1A1008", border:"1px solid #2A1E12", borderRadius:16, padding:28 }}>
          <div style={{ height:3, background:"#C8553D", borderRadius:3, marginBottom:24 }} />

          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:6, fontWeight:700 }}>UTILISATEUR</div>
            <input className="input" placeholder="Votre nom d'utilisateur" value={username}
              onChange={e => { setUsername(e.target.value); setError(""); }}
              onKeyDown={e => e.key==="Enter" && handleLogin()} autoFocus />
          </div>

          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:6, fontWeight:700 }}>MOT DE PASSE</div>
            <input className="input" type="password" placeholder="‚Ä¢‚Ä¢‚Ä¢‚Ä¢‚Ä¢‚Ä¢‚Ä¢‚Ä¢" value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key==="Enter" && handleLogin()} />
          </div>

          {error && (
            <div style={{ background:"#2D0D0D", border:"1px solid #7A1E17", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#E74C3C", marginBottom:14 }}>
              ‚ö†Ô∏è {error}
            </div>
          )}

          <button className="btn btn-accent" style={{ width:"100%", padding:13, fontSize:14 }}
            onClick={handleLogin} disabled={loading}>
            {loading ? "Connexion‚Ä¶" : "Se connecter ‚Ü'"}
          </button>
        </div>

        <div style={{ textAlign:"center", marginTop:20, fontSize:11, color:"#3A2A18" }}>
          Acc√®s r√©serv√© √† l'√©quipe TalentMA
        </div>
      </div>
    </div>
  );
}

// ‚"Ä‚"Ä‚"Ä CLIENT PORTAL STANDALONE ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
function ClientPortalPage({ profiles, contracts, domains, skills, march√©s }) {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("Tous");
  const [contract, setContract] = useState("Tous");
  const [march√©, setMarch√©] = useState("Tous");
  const [dispoOnly, setDispoOnly] = useState(false);
  const [certOnly, setCertOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [requested, setRequested] = useState(new Set());

  const filtered = useMemo(() => profiles.filter(p => {
    const q = search.toLowerCase();
    const ms = !q || `${p.firstName} ${p.lastName} ${p.headline} ${p.domain}`.toLowerCase().includes(q) || (p.skills||[]).some(s=>s.toLowerCase().includes(q));
    const md = domain==="Tous" || p.domain===domain;
    const mc = contract==="Tous" || p.contractType===contract;
    const mm = march√©==="Tous" || p.marche===march√©;
    const mdi = !dispoOnly || p.disponible;
    const mce = !certOnly || p.screened;
    return ms && md && mc && mm && mdi && mce;
  }), [profiles, search, domain, contract, march√©, dispoOnly, certOnly]);

  const handleRequest = async (p) => {
    setRequested(r => new Set([...r, p.id]));
    const reqs = await load("tm-v3-client-requests") || [];
    await save("tm-v3-client-requests", [...reqs, { profileId: p.id, name: `${p.firstName} ${p.lastName}`, date: new Date().toISOString() }]);
  };

  const ct = (id) => contracts.find(c=>c.id===id) || contracts[0] || { label:"‚Ä"", color:"#888", bg:"#222" };

  return (
    <div style={{ minHeight:"100vh", background:"#0D0A06" }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ background:"#110D06", borderBottom:"1px solid #2A1E12", padding:"0 16px" }}>
        <div style={{ maxWidth:780, margin:"0 auto", display:"flex", alignItems:"center", height:56, gap:12 }}>
          <div style={{ fontSize:22 }}>üá≤üá¶</div>
          <div>
            <div style={{ fontSize:15, fontWeight:800 }}>TalentMA</div>
            <div style={{ fontSize:9, color:"#5A4A3A", fontFamily:"'JetBrains Mono'", letterSpacing:"1px" }}>PORTAIL CLIENT</div>
          </div>
          <div style={{ marginLeft:"auto", fontSize:12, color:"#5A4A3A" }}>
            <b style={{ color:"#C8553D" }}>{profiles.filter(p=>p.disponible).length}</b> talents disponibles
          </div>
        </div>
      </div>

      <div style={{ maxWidth:780, margin:"0 auto", padding:16 }}>
        {/* Hero */}
        <div style={{ background:"linear-gradient(135deg,#0F6E5618,#185FA512)", border:"1px solid #2A1E12", borderRadius:14, padding:"20px 22px", marginBottom:18 }}>
          <div style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>Trouvez votre talent</div>
          <div style={{ fontSize:12, color:"#7A6A5A" }}>Freelances et consultants marocains certifi√©s ¬∑ Disponibles en France et au Maroc</div>
        </div>

        {/* Filters */}
        <div style={{ background:"#110D06", borderRadius:12, padding:14, marginBottom:14 }}>
          <input className="input" placeholder="ü"ç Nom, comp√©tence, domaine‚Ä¶" value={search}
            onChange={e => setSearch(e.target.value)} style={{ marginBottom:10 }} />
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
            <select className="input" style={{ flex:"1 1 110px" }} value={domain} onChange={e => setDomain(e.target.value)}>
              <option value="Tous">Tous domaines</option>
              {domains.map(d => <option key={d}>{d}</option>)}
            </select>
            <select className="input" style={{ flex:"1 1 120px" }} value={contract} onChange={e => setContract(e.target.value)}>
              <option value="Tous">Tous contrats</option>
              {contracts.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <select className="input" style={{ flex:"1 1 110px" }} value={march√©} onChange={e => setMarch√©(e.target.value)}>
              <option value="Tous">üåç Tous march√©s</option>
              {march√©s.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div style={{ display:"flex", gap:16 }}>
            {[[dispoOnly,setDispoOnly,"Disponibles uniquement"],[certOnly,setCertOnly,"Certifi√©s uniquement"]].map(([v,s,l]) => (
              <label key={l} style={{ display:"flex", alignItems:"center", gap:7, cursor:"pointer", fontSize:12, color:"#7A6A5A", userSelect:"none" }}>
                <div onClick={() => s(!v)} style={{ width:34, height:18, borderRadius:9, background: v?"#0F6E56":"#2A1E12", position:"relative", transition:"background .2s", flexShrink:0 }}>
                  <div style={{ position:"absolute", top:2, left: v?17:2, width:14, height:14, borderRadius:"50%", background:"#fff", transition:"left .2s" }} />
                </div>
                {l}
              </label>
            ))}
          </div>
        </div>

        <div style={{ fontSize:12, color:"#5A4A3A", marginBottom:12 }}>
          <b style={{ color:"#C8553D" }}>{filtered.length}</b> talent{filtered.length>1?"s":""} trouv√©{filtered.length>1?"s":""}
        </div>

        {/* List */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.length === 0
            ? <div style={{ textAlign:"center", padding:"50px 0", color:"#5A4A3A" }}><div style={{ fontSize:36, marginBottom:10 }}>ü"ç</div>Aucun talent ‚Ä" modifiez les filtres</div>
            : filtered.map(p => {
                const c = ct(p.contractType);
                const isReq = requested.has(p.id);
                return (
                  <div key={p.id} className="card" style={{ padding:"14px 16px", cursor:"pointer" }} onClick={() => setSelected(p)}>
                    <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                      <div style={{ width:44, height:44, borderRadius:10, background:`${c.color}20`, border:`1px solid ${c.color}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:c.color, flexShrink:0 }}>
                        {p.firstName?.[0]}{p.lastName?.[0]}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:3 }}>
                          <span style={{ fontWeight:700, fontSize:14 }}>{p.firstName} {p.lastName}</span>
                          {p.screened && <span className="tag" style={{ background:"#0D3320", color:"#2ECC71", border:"1px solid #1A7A4340" }}>‚ú" Certifi√©</span>}
                          <span className="tag" style={{ background:c.bg, color:c.color, border:`1px solid ${c.color}40` }}>{c.label}</span>
                        </div>
                        <div style={{ fontSize:12, color:"#7A6A5A", marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.headline}</div>
                        <div style={{ display:"flex", gap:10, fontSize:11, color:"#5A4A3A", flexWrap:"wrap" }}>
                          <span>ü"ç {p.location}</span>
                          <span style={{ color: p.disponible?"#2ECC71":"#E74C3C" }}>‚óè {p.disponible?"Disponible":"Occup√©"}</span>
                          {p.domain && <span>{p.domain}</span>}
                        </div>
                        {(p.skills||[]).length > 0 && (
                          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:5 }}>
                            {(p.skills||[]).slice(0,4).map(s => (
                              <span key={s} className="tag" style={{ background:"#1E1208", color:"#7A6A5A", border:"1px solid #2A1E12" }}>{s}</span>
                            ))}
                            {(p.skills||[]).length > 4 && <span style={{ fontSize:10, color:"#5A4A3A" }}>+{p.skills.length-4}</span>}
                          </div>
                        )}
                      </div>
                      <button
                        style={{ padding:"8px 14px", borderRadius:8, border:`1px solid ${isReq?"#1A7A43":c.color}`, background:isReq?"#0D3320":"transparent", color:isReq?"#2ECC71":c.color, cursor:isReq?"default":"pointer", fontSize:11, fontWeight:700, fontFamily:"'Syne'", flexShrink:0, whiteSpace:"nowrap" }}
                        onClick={e => { e.stopPropagation(); if(!isReq) handleRequest(p); }}>
                        {isReq ? "‚ú" Demand√©" : "Demander dispo"}
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
                <div style={{ fontWeight:800, fontSize:17 }}>{selected.firstName} {selected.lastName}</div>
                <div style={{ fontSize:12, color:"#7A6A5A" }}>{selected.headline}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>‚úï</button>
            </div>
            {selected.screened && (
              <div style={{ background:"#0D3320", border:"1px solid #1A7A43", borderRadius:10, padding:12, marginBottom:14 }}>
                <div style={{ fontWeight:700, color:"#2ECC71", marginBottom:4 }}>‚ú" Profil certifi√© par screening ind√©pendant</div>
                <div style={{ fontSize:12, color:"#D5BDAC" }}>{selected.screeningNote}</div>
              </div>
            )}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
              {[["Localisation",selected.location],["Contrat",ct(selected.contractType).label],["Domaine",selected.domain],["Disponibilit√©",selected.disponible?"‚úÖ Disponible":"‚ùå Occup√©"]].map(([l,v]) => (
                <div key={l} style={{ background:"#110D06", borderRadius:8, padding:"8px 10px" }}>
                  <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:2 }}>{l}</div>
                  <div style={{ fontSize:12 }}>{v}</div>
                </div>
              ))}
            </div>
            {selected.education && <div style={{ marginBottom:8 }}><div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>ü"ö Formation</div><div style={{ fontSize:12, color:"#D5BDAC", background:"#110D06", padding:"8px 10px", borderRadius:8 }}>{selected.education}</div></div>}
            {(selected.skills||[]).length > 0 && (
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:6 }}>ü"ß Comp√©tences</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{(selected.skills||[]).map(s=><span key={s} className="tag" style={{ background:"#1E1208", color:"#D5BDAC", border:"1px solid #2A1E12", fontSize:11, padding:"3px 10px" }}>{s}</span>)}</div>
              </div>
            )}
            <button
              style={{ width:"100%", padding:13, borderRadius:10, border:`1px solid ${requested.has(selected.id)?"#1A7A43":"#C8553D"}`, background:requested.has(selected.id)?"#0D3320":"#C8553D20", color:requested.has(selected.id)?"#2ECC71":"#C8553D", cursor:requested.has(selected.id)?"default":"pointer", fontWeight:700, fontSize:14, fontFamily:"'Syne'" }}
              onClick={() => { if(!requested.has(selected.id)) handleRequest(selected); }}>
              {requested.has(selected.id) ? "‚ú" Demande envoy√©e" : "Demander la disponibilit√©"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ‚"Ä‚"Ä‚"Ä MAIN APP ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
export default function App() {
  const [session, setSession] = useState(null);        // null = not checked, false = logged out, obj = logged in
  const [appMode, setAppMode] = useState("home");    // "home" | "client" | "admin"
  const [checking, setChecking] = useState(true);

  // Config state
  const [profiles, setProfiles] = useState([]);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [view, setView] = useState("list");
  const [currentUser, setCurrentUser] = useState("Mohamed");
  const [cfgDomains, setCfgDomains] = useState(["Dev","Design","Data","Marketing","Finance","Autre"]);
  const [cfgSkills, setCfgSkills] = useState(SKILLS_BY_DOMAIN);
  const [cfgUsers, setCfgUsers] = useState(["Mohamed","Coll√®gue"]);
  const [cfgStages, setCfgStages] = useState(PIPELINE_STAGES);
  const [cfgContracts, setCfgContracts] = useState([
    { id:"freelance",  label:"Freelance",  color:"#0F6E56", bg:"#0A2018" },
    { id:"cdi_maroc",  label:"CDI Maroc",  color:"#BA7517", bg:"#1E1400" },
    { id:"cdi_france", label:"CDI France", color:"#185FA5", bg:"#0A1420" },
  ]);
  const [cfgMarch√©s, setCfgMarch√©s] = useState([
    { id:"maroc",  label:"üá≤üá¶ Maroc",  flag:"üá≤üá¶" },
    { id:"france", label:"üá´üá∑ France", flag:"üá´üá∑" },
  ]);

  // Check existing session on load
  useEffect(() => {
    load("tm-v3-session").then(s => {
      if (s) setSession(s);
      setChecking(false);
    });
    load("tm-v3-profiles").then(s => {
      if (s?.length) setProfiles(s.map(p => scoreProfile(p, DEFAULT_WEIGHTS)));
      else { const sc = SAMPLE.map(p => scoreProfile(p, DEFAULT_WEIGHTS)); setProfiles(sc); save("tm-v3-profiles", sc); }
    });
    load("tm-v3-weights").then(w => { if (w) setWeights(w); });
    load("tm-v3-domains").then(d => { if (d) setCfgDomains(d); });
    load("tm-v3-skills").then(s => { if (s) setCfgSkills(s); });
    load("tm-v3-users").then(u => { if (u) setCfgUsers(u); });
    load("tm-v3-stages").then(s => { if (s) setCfgStages(s); });
    load("tm-v3-contracts").then(c => { if (c) setCfgContracts(c); });
    load("tm-v3-marches").then(m => { if (m) setCfgMarch√©s(m); });
  }, []);

  const persist = useCallback(async (p) => { setProfiles(p); await save("tm-v3-profiles", p); }, []);
  const logout = async () => { await save("tm-v3-session", null); setSession(null); setAppMode("home"); };

  // ‚"Ä‚"Ä HOME SCREEN (choix entr√©e)
  if (appMode === "home") {
    return (
      <div style={{ minHeight:"100vh", background:"#0D0A06", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
        <style>{css}</style>
        <div style={{ width:"100%", maxWidth:400, textAlign:"center" }}>
          <div style={{ fontSize:44, marginBottom:12 }}>üá≤üá¶</div>
          <div style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>TalentMA</div>
          <div style={{ fontSize:12, color:"#5A4A3A", marginBottom:40, fontFamily:"'JetBrains Mono'", letterSpacing:"1px" }}>PLATEFORME RH ¬∑ TALENTS MAROCAINS</div>

          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <button className="btn btn-teal" style={{ padding:"16px 24px", fontSize:15, borderRadius:12 }}
              onClick={() => setAppMode("client")}>
              <span style={{ fontSize:18 }}>ü'§</span>&nbsp; Portail Client
              <div style={{ fontSize:11, fontWeight:400, color:"#9FE1CB", marginTop:3 }}>Rechercher un talent ¬∑ Demander une disponibilit√©</div>
            </button>

            <button className="btn btn-accent" style={{ padding:"16px 24px", fontSize:15, borderRadius:12 }}
              onClick={() => setAppMode("admin")}>
              <span style={{ fontSize:18 }}>ü"ê</span>&nbsp; Espace Admin
              <div style={{ fontSize:11, fontWeight:400, color:"#F5C4B3", marginTop:3 }}>CRM ¬∑ Param√®tres ¬∑ Gestion des profils</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ‚"Ä‚"Ä CLIENT PORTAL
  if (appMode === "client") {
    return (
      <div>
        <ClientPortalPage
          profiles={profiles}
          contracts={cfgContracts}
          domains={cfgDomains}
          skills={cfgSkills}
          march√©s={cfgMarch√©s}
        />
        <div style={{ textAlign:"center", padding:"12px 0 20px" }}>
          <button className="btn btn-ghost" style={{ fontSize:11, opacity:0.5 }} onClick={() => setAppMode("home")}>
            ‚Üê Accueil
          </button>
        </div>
      </div>
    );
  }

  // ‚"Ä‚"Ä ADMIN LOGIN
  if (appMode === "admin" && !session) {
    if (checking) return <div style={{ minHeight:"100vh", background:"#0D0A06", display:"flex", alignItems:"center", justifyContent:"center", color:"#5A4A3A" }}><style>{css}</style>Chargement‚Ä¶</div>;
    return <LoginScreen onLogin={s => setSession(s)} onBack={() => setAppMode("home")} />;
  }

  // ‚"Ä‚"Ä ADMIN BACK-OFFICE
  return <AdminApp
    session={session}
    onLogout={logout}
    onSwitchClient={() => setAppMode("home")}
    profiles={profiles} persist={persist}
    weights={weights} setWeights={setWeights}
    view={view} setView={setView}
    currentUser={currentUser} setCurrentUser={setCurrentUser}
    cfgDomains={cfgDomains} setCfgDomains={setCfgDomains}
    cfgSkills={cfgSkills} setCfgSkills={setCfgSkills}
    cfgUsers={cfgUsers} setCfgUsers={setCfgUsers}
    cfgStages={cfgStages} setCfgStages={setCfgStages}
    cfgContracts={cfgContracts} setCfgContracts={setCfgContracts}
    cfgMarch√©s={cfgMarch√©s} setCfgMarch√©s={setCfgMarch√©s}
  />;
}

// ‚"Ä‚"Ä‚"Ä ADMIN APP ‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä‚"Ä
function AdminApp({ session, onLogout, onSwitchClient, profiles, persist, weights, setWeights, view, setView, currentUser, setCurrentUser, cfgDomains, setCfgDomains, cfgSkills, setCfgSkills, cfgUsers, setCfgUsers, cfgStages, setCfgStages, cfgContracts, setCfgContracts, cfgMarch√©s, setCfgMarch√©s }) {
  const [search, setSearch] = useState("");
  const [filterDomain, setFilterDomain] = useState("Tous");
  const [filterSkills, setFilterSkills] = useState([]);
  const toggleSkill = (s) => setFilterSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const [filterContract, setFilterContract] = useState("Tous");
  const [filterMarche, setFilterMarche] = useState("Tous");
  const [filterStage, setFilterStage] = useState("Tous");
  const [filterUser, setFilterUser] = useState("Tous");
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [callModal, setCallModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [showScoring, setShowScoring] = useState(false);
  const [showInscription, setShowInscription] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [csvCopied, setCsvCopied] = useState(false);

  const overdueCount = useMemo(() => profiles.filter(isOverdue).length, [profiles]);

  const handleCallSave = async ({ callEntry, newStage, rappelDate }) => {
    await persist(profiles.map(p => p.id === callModal.id ? { ...p, pipelineStage:newStage, rappelDate, callHistory:[callEntry,...(p.callHistory||[])] } : p));
    setCallModal(null);
  };
  const handleUpdate = async (updated) => {
    const r = scoreProfile(updated, weights);
    await persist(profiles.map(p => p.id===r.id ? r : p));
  };
  const handleDrop = async (profileId, newStage) => {
    await persist(profiles.map(p => p.id===profileId ? { ...p, pipelineStage:newStage } : p));
  };
  const handleScoringApply = async (w) => {
    setWeights(w); await save("tm-v3-weights", w);
    await persist(profiles.map(p => scoreProfile(p, w)));
    setShowScoring(false);
  };
  const handleInscription = async (profile) => {
    const sc = scoreProfile({ ...profile, id:Date.now(), pipelineStage:"nouveau", callHistory:[], notes:[], rappelDate:"", scoreOverride:null, assignedTo:currentUser, screened:false, screeningNote:"" }, weights);
    await persist([sc, ...profiles]);
    setShowInscription(false);
  };

  const stats = useMemo(() => ({
    total: profiles.length,
    dispo: profiles.filter(p=>p.disponible).length,
    certified: profiles.filter(p=>p.screened).length,
    overdue: overdueCount,
    plac√©: profiles.filter(p=>p.pipelineStage==="plac√©").length,
    stageBreak: cfgStages.map(s => ({ ...s, count: profiles.filter(p=>p.pipelineStage===s.id).length })),
  }), [profiles, overdueCount, cfgStages]);

  const filtered = useMemo(() => profiles.filter(p => {
    const q = search.toLowerCase();
    const ms = !q || `${p.firstName} ${p.lastName} ${p.headline} ${p.location}`.toLowerCase().includes(q);
    const md = filterDomain==="Tous" || p.domain===filterDomain;
    const msk = filterSkills.length===0 || filterSkills.every(fs=>(p.skills||[]).some(s=>s.toLowerCase().includes(fs.toLowerCase())));
    const mc = filterContract==="Tous" || p.contractType===filterContract;
    const mm = filterMarche==="Tous" || p.marche===filterMarche;
    const mst = filterStage==="Tous" || p.pipelineStage===filterStage;
    const mu = filterUser==="Tous" || p.assignedTo===filterUser;
    const mo = !filterOverdue || isOverdue(p);
    return ms && md && msk && mc && mm && mst && mu && mo;
  }).sort((a,b) => (b.scoreOverride??b.score)-(a.scoreOverride??a.score)), [profiles,search,filterDomain,filterSkills,filterContract,filterMarche,filterStage,filterUser,filterOverdue]);

  return (
    <div style={{ minHeight:"100vh", background:"#0D0A06" }}>
      <style>{css}</style>

      {/* NAV */}
      <div style={{ background:"#110D06", borderBottom:"1px solid #2A1E12", padding:"0 16px", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", alignItems:"center", height:52, gap:8 }}>
          <div style={{ marginRight:"auto" }}>
            <div style={{ fontSize:13, fontWeight:800 }}>üá≤üá¶ TalentMA <span style={{ fontSize:10, color:"#C8553D", fontWeight:400 }}>Admin</span></div>
            <div style={{ fontSize:9, color:"#5A4A3A", fontFamily:"'JetBrains Mono'", letterSpacing:"1px" }}>{session?.username}</div>
          </div>

          {/* User switcher */}
          <select value={currentUser} onChange={async e => { setCurrentUser(e.target.value); await save("tm-v3-user", e.target.value); }}
            style={{ background:"#1A1008", border:"1px solid #2A1E12", borderRadius:8, padding:"4px 10px", color:"#F0EDE8", fontSize:11, fontFamily:"'Syne'", cursor:"pointer", outline:"none" }}>
            {cfgUsers.map(u => <option key={u}>{u}</option>)}
          </select>

          {/* Notif */}
          <div style={{ position:"relative" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setFilterOverdue(!filterOverdue)}
              style={{ borderColor: filterOverdue?"#E74C3C":"#2A1E12", color: filterOverdue?"#E74C3C":"#7A6A5A" }}>
              ü""{overdueCount > 0 && <span style={{ color:"#E74C3C", fontWeight:800, marginLeft:3 }}>{overdueCount}</span>}
            </button>
            {overdueCount > 0 && !filterOverdue && <div className="notif-dot" />}
          </div>

          <button className="btn btn-ghost btn-sm" onClick={() => { setShowCSV(true); setCsvCopied(false); }}>‚Ü" CSV</button>

          {/* Views */}
          {[["list","‚ò∞"],["kanban","‚¨ú"],["settings","‚öôÔ∏è"]].map(([v,l]) => (
            <button key={v} className={`nav-tab ${view===v?"active":""}`} onClick={() => setView(v)} style={{ padding:"6px 10px" }}>{l}</button>
          ))}

          {/* Client portal link */}
          <button className="btn btn-ghost btn-sm" style={{ color:"#0F6E56", borderColor:"#0F6E5640" }} onClick={onSwitchClient}>
            Portail client ‚Ü'
          </button>

          {/* Logout */}
          <button className="btn btn-ghost btn-sm" style={{ color:"#E74C3C", borderColor:"#7A1E17" }} onClick={onLogout}>
            D√©connexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"14px 16px" }}>

        {/* Stats band */}
        {view !== "settings" && (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8, marginBottom:12 }}>
              {[["Total",stats.total,"#F0EDE8"],["Dispos",stats.dispo,"#2ECC71"],["Certifi√©s",stats.certified,"#F0B429"],["Plac√©s",stats.plac√©,"#C8553D"],["‚ö†Ô∏è",stats.overdue,"#E74C3C"]].map(([l,v,c]) => (
                <div key={l} className="card" style={{ padding:"8px", textAlign:"center" }}>
                  <div style={{ fontSize:18, fontWeight:800, color:c, fontFamily:"'JetBrains Mono'" }}>{v}</div>
                  <div style={{ fontSize:9, color:"#5A4A3A", marginTop:1 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Pipeline bar */}
            <div style={{ display:"flex", gap:4, marginBottom:6 }}>
              {stats.stageBreak.map(s => (
                <div key={s.id} onClick={() => setFilterStage(filterStage===s.id?"Tous":s.id)}
                  title={s.label}
                  style={{ flex:s.count||0.3, height:20, background: filterStage===s.id?s.color:s.bg, border:`1px solid ${s.color}40`, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", minWidth:24 }}>
                  <span style={{ fontSize:9, color: filterStage===s.id?"#fff":s.color, fontWeight:700, fontFamily:"'JetBrains Mono'" }}>{s.count}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, marginBottom:14, overflowX:"auto" }}>
              {cfgStages.map(s => (
                <span key={s.id} style={{ fontSize:9, color: filterStage===s.id?s.color:"#5A4A3A", whiteSpace:"nowrap", cursor:"pointer" }}
                  onClick={() => setFilterStage(filterStage===s.id?"Tous":s.id)}>{s.label}</span>
              ))}
            </div>

            {/* Filters */}
            <div style={{ background:"#110D06", borderRadius:12, padding:12, marginBottom:12 }}>
              <div style={{ marginBottom:8 }}>
                <input className="input" placeholder="ü"ç Nom, titre, ville‚Ä¶" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <select className="input" style={{ flex:"1 1 90px" }} value={filterDomain} onChange={e => { setFilterDomain(e.target.value); setFilterSkills([]); }}>
                  <option value="Tous">Tous domaines</option>
                  {cfgDomains.map(d => <option key={d}>{d}</option>)}
                </select>
                <select className="input" style={{ flex:"1 1 110px" }} value={filterContract} onChange={e => setFilterContract(e.target.value)}>
                  <option value="Tous">Tous contrats</option>
                  {cfgContracts.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <select className="input" style={{ flex:"1 1 90px" }} value={filterMarche} onChange={e => setFilterMarche(e.target.value)}>
                  <option value="Tous">üåç Tous</option>
                  {cfgMarch√©s.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
                <select className="input" style={{ flex:"1 1 90px" }} value={filterUser} onChange={e => setFilterUser(e.target.value)}>
                  <option value="Tous">ü'§ Tous</option>
                  {cfgUsers.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <SkillFilter domain={filterDomain} selected={filterSkills} onToggle={toggleSkill} onClear={() => setFilterSkills([])} skills={cfgSkills} />
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
              <div style={{ display:"flex", gap:6 }}>
                {[["list","‚ò∞ Liste"],["kanban","‚¨ú Kanban"]].map(([v,l]) => (
                  <button key={v} className={`nav-tab ${view===v?"active":""}`} onClick={() => setView(v)}>{l}</button>
                ))}
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:12, color:"#5A4A3A" }}><b style={{ color:"#C8553D" }}>{filtered.length}</b> profil{filtered.length>1?"s":""}</span>
                {filterOverdue && <span className="tag" style={{ background:"#2D0D0D", color:"#E74C3C", border:"1px solid #7A1E17", cursor:"pointer" }} onClick={() => setFilterOverdue(false)}>‚ö†Ô∏è Retards ‚úï</span>}
                <button className="btn btn-teal btn-sm" onClick={() => setShowInscription(true)}>+ Inscrire</button>
              </div>
            </div>
          </>
        )}

        {/* LIST */}
        {view === "list" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtered.length === 0
              ? <div style={{ textAlign:"center", padding:"50px 0", color:"#5A4A3A" }}><div style={{ fontSize:32, marginBottom:10 }}>ü"ç</div>Aucun profil</div>
              : filtered.map((p, i) => {
                  const c = cfgContracts.find(c=>c.id===p.contractType) || cfgContracts[0] || { label:"‚Ä"", color:"#888", bg:"#222" };
                  const stage = cfgStages.find(s=>s.id===p.pipelineStage) || cfgStages[0];
                  const score = p.scoreOverride??p.score;
                  return (
                    <div key={p.id} className="card slide-in" onClick={() => setDetailModal(p)}
                      style={{ padding:"13px 15px", borderLeft:`3px solid ${isOverdue(p)?"#E74C3C":stage?.color||"#2A1E12"}`, cursor:"pointer" }}>
                      <div style={{ display:"flex", gap:11, alignItems:"flex-start" }}>
                        <div style={{ width:26, height:26, borderRadius:7, background:i<3?"#C8553D20":"#1E1208", border:`1px solid ${i<3?"#C8553D":"#2A1E12"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontFamily:"'JetBrains Mono'", color:i<3?"#C8553D":"#7A6A5A", flexShrink:0, fontWeight:700 }}>{i+1}</div>
                        <div style={{ width:38, height:38, borderRadius:9, background:`${c.color}20`, border:`1px solid ${c.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:c.color, flexShrink:0 }}>{p.firstName?.[0]}{p.lastName?.[0]}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:3 }}>
                            <span style={{ fontWeight:700, fontSize:13 }}>{p.firstName} {p.lastName}</span>
                            <ScoreBadge score={score} niveau={p.niveau} />
                            <StageBadge stage={p.pipelineStage} stages={cfgStages} />
                          </div>
                          <div style={{ fontSize:11, color:"#7A6A5A", marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.headline}</div>
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                            <span style={{ fontSize:10, color:"#5A4A3A" }}>ü"ç {p.location}</span>
                            <span className="tag" style={{ background:c.bg, color:c.color, border:`1px solid ${c.color}40` }}>{c.label}</span>
                            {p.screened && <span className="tag" style={{ background:"#0D3320", color:"#2ECC71", border:"1px solid #1A7A4340" }}>‚ú"</span>}
                            {p.rappelDate && <span style={{ fontSize:10, color:isOverdue(p)?"#E74C3C":"#F0B429" }}>ü"Ö {fmtDate(p.rappelDate)}</span>}
                            {p.callHistory?.length>0 && <span style={{ fontSize:10, color:"#5A4A3A" }}>ü"û {p.callHistory.length}</span>}
                            <span style={{ fontSize:10, color:"#5A4A3A" }}>ü'§ {p.assignedTo}</span>
                          </div>
                          {(p.skills||[]).length>0 && (
                            <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:5 }}>
                              {(p.skills||[]).slice(0,5).map(s=>(
                                <span key={s} className="tag"
                                  style={{ background:filterSkills.includes(s)?"#C8553D20":"#1E1208", color:filterSkills.includes(s)?"#C8553D":"#7A6A5A", border:`1px solid ${filterSkills.includes(s)?"#C8553D40":"#2A1E12"}`, cursor:"pointer" }}
                                  onClick={e=>{e.stopPropagation();toggleSkill(s);}}>
                                  {filterSkills.includes(s)?"‚ú" ":""}{s}
                                </span>
                              ))}
                              {(p.skills||[]).length>5 && <span style={{ fontSize:10, color:"#5A4A3A" }}>+{p.skills.length-5}</span>}
                            </div>
                          )}
                        </div>
                        <button className="btn" style={{ background:"#25D366", color:"#fff", padding:"7px 11px", fontSize:11, flexShrink:0 }}
                          onClick={e=>{e.stopPropagation();setCallModal(p);}}>ü"û</button>
                      </div>
                      {p.notes?.length>0 && (
                        <div style={{ marginTop:7, fontSize:11, color:"#7A6A5A", background:"#110D06", padding:"5px 9px", borderRadius:6, borderLeft:"2px solid #2A1E12" }}>
                          ü"ù {p.notes[0].text.slice(0,80)}{p.notes[0].text.length>80?"‚Ä¶":""}
                        </div>
                      )}
                    </div>
                  );
                })
            }
          </div>
        )}

        {/* KANBAN */}
        {view === "kanban" && (
          <KanbanView profiles={filtered} stages={cfgStages} onCardClick={setDetailModal} onDrop={handleDrop} />
        )}

        {/* SETTINGS PAGE */}
        {view === "settings" && (
          <SettingsView
            weights={weights} onWeightsChange={async w => { setWeights(w); await save("tm-v3-weights",w); await persist(profiles.map(p=>scoreProfile(p,w))); }}
            domains={cfgDomains} onDomainsChange={async d => { setCfgDomains(d); await save("tm-v3-domains",d); }}
            skills={cfgSkills} onSkillsChange={async s => { setCfgSkills(s); await save("tm-v3-skills",s); }}
            users={cfgUsers} onUsersChange={async u => { setCfgUsers(u); await save("tm-v3-users",u); }}
            stages={cfgStages} onStagesChange={async s => { setCfgStages(s); await save("tm-v3-stages",s); }}
            contracts={cfgContracts} onContractsChange={async c => { setCfgContracts(c); await save("tm-v3-contracts",c); }}
            march√©s={cfgMarch√©s} onMarch√©sChange={async m => { setCfgMarch√©s(m); await save("tm-v3-marches",m); }}
          />
        )}
      </div>

      {/* MODALS */}
      {callModal && <CallModal profile={callModal} currentUser={currentUser} onClose={() => setCallModal(null)} onSave={handleCallSave} />}
      {detailModal && <ProfileModal profile={detailModal} currentUser={currentUser} stages={cfgStages} users={cfgUsers}
        onClose={() => setDetailModal(null)}
        onCall={p => { setDetailModal(null); setCallModal(p); }}
        onUpdate={async p => { await handleUpdate(p); setDetailModal(p); }} />}
      {showScoring && <ScoringModal weights={weights} onClose={() => setShowScoring(false)} onSave={handleScoringApply} />}
      {showInscription && (
        <div className="overlay" onClick={() => setShowInscription(false)}>
          <div className="modal slide-in" onClick={e => e.stopPropagation()} style={{ maxWidth:520 }}>
            <div style={{ height:4, background:"#0F6E56", borderRadius:4, marginBottom:18 }} />
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
              <div style={{ fontWeight:800, fontSize:16 }}>Inscrire un profil</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowInscription(false)}>‚úï</button>
            </div>
            <InscriptionForm domains={cfgDomains} skills={cfgSkills} contracts={cfgContracts} march√©s={cfgMarch√©s} onSave={handleInscription} onCancel={() => setShowInscription(false)} />
          </div>
        </div>
      )}

      {/* CSV MODAL */}
      {showCSV && (
        <div className="overlay" onClick={() => setShowCSV(false)}>
          <div className="modal slide-in" onClick={e => e.stopPropagation()} style={{ maxWidth:560 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:15 }}>Export CSV ‚Ä" {filtered.length} profils</div>
                <div style={{ fontSize:11, color:"#7A6A5A", marginTop:2 }}>Copie ‚Ü' colle dans Excel ou Google Sheets</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCSV(false)}>‚úï</button>
            </div>
            <textarea readOnly value={buildCSV(filtered)}
              style={{ width:"100%", height:200, background:"#110D06", border:"1px solid #2A1E12", borderRadius:8, padding:"10px 12px", color:"#D5BDAC", fontFamily:"'JetBrains Mono',monospace", fontSize:10, resize:"none", outline:"none", lineHeight:1.6 }}
              onFocus={e => e.target.select()} />
            <div style={{ display:"flex", gap:10, marginTop:12 }}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setShowCSV(false)}>Fermer</button>
              <button className="btn" style={{ flex:2, background:csvCopied?"#0D3320":"#C8553D", color:csvCopied?"#2ECC71":"#fff", border:"none", padding:10, fontSize:13 }}
                onClick={() => navigator.clipboard.writeText(buildCSV(filtered)).then(()=>{setCsvCopied(true);setTimeout(()=>setCsvCopied(false),2500)})}>
                {csvCopied ? "‚ú" Copi√© !" : "ü"ã Copier tout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InscriptionForm({ domains, skills, contracts, march√©s, onSave, onCancel }) {
  const [f, setF] = useState({ firstName:"", lastName:"", headline:"", location:"", education:"", experience:"", phone:"", email:"", linkedinUrl:"", contractType:contracts[0]?.id||"freelance", domain:domains[0]||"Dev", skills:[], disponible:true, marche:march√©s[0]?.id||"maroc" });
  const [skillInput, setSkillInput] = useState("");
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const addSkill = s => { if(s&&!f.skills.includes(s)) setF(p=>({...p,skills:[...p.skills,s]})); setSkillInput(""); };
  const removeSkill = s => setF(p=>({...p,skills:p.skills.filter(x=>x!==s)}));
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        <div><div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>PR√âNOM *</div><input className="input" placeholder="Karim" value={f.firstName} onChange={e=>set("firstName",e.target.value)} /></div>
        <div><div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>NOM *</div><input className="input" placeholder="Ouazzani" value={f.lastName} onChange={e=>set("lastName",e.target.value)} /></div>
      </div>
      <div style={{ marginBottom:10 }}><div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>TITRE</div><input className="input" placeholder="Dev Full Stack Freelance | React‚Ä¶" value={f.headline} onChange={e=>set("headline",e.target.value)} /></div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        <div><div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>CONTRAT</div><select className="input" value={f.contractType} onChange={e=>set("contractType",e.target.value)}>{contracts.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
        <div><div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>MARCH√â</div><select className="input" value={f.marche} onChange={e=>set("marche",e.target.value)}>{march√©s.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select></div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        <div><div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>DOMAINE</div><select className="input" value={f.domain} onChange={e=>{set("domain",e.target.value);set("skills",[]);}}>{domains.map(d=><option key={d}>{d}</option>)}</select></div>
        <div><div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>VILLE</div><input className="input" placeholder="Casablanca" value={f.location} onChange={e=>set("location",e.target.value)} /></div>
      </div>
      <div style={{ marginBottom:10 }}>
        <div style={{ fontSize:10, color:"#5A4A3A", marginBottom:6 }}>ü"ß COMP√âTENCES</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:6 }}>
          {(skills[f.domain]||[]).map(s=>(
            <span key={s} onClick={()=>f.skills.includes(s)?removeSkill(s):addSkill(s)}
              style={{ fontSize:10, padding:"3px 9px", borderRadius:4, cursor:"pointer", background:f.skills.includes(s)?"#C8553D20":"#1E1208", color:f.skills.includes(s)?"#C8553D":"#7A6A5A", border:`1px solid ${f.skills.includes(s)?"#C8553D40":"#2A1E12"}` }}>
              {f.skills.includes(s)?"‚ú" ":"+ "}{s}
            </span>
          ))}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <input className="input" placeholder="Autre comp√©tence‚Ä¶" value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addSkill(skillInput.trim());}}} />
          <button className="btn btn-ghost btn-sm" onClick={()=>addSkill(skillInput.trim())}>+</button>
        </div>
      </div>
      <div style={{ marginBottom:10 }}><div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>FORMATIONS</div><input className="input" placeholder="UM5 Rabat, ISCAE‚Ä¶" value={f.education} onChange={e=>set("education",e.target.value)} /></div>
      <div style={{ marginBottom:10 }}><div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>EXP√âRIENCES</div><input className="input" placeholder="OCP Maroc, Capgemini‚Ä¶" value={f.experience} onChange={e=>set("experience",e.target.value)} /></div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        <div><div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>T√âL√âPHONE</div><input className="input" placeholder="+212 6‚Ä¶" value={f.phone} onChange={e=>set("phone",e.target.value)} /></div>
        <div><div style={{ fontSize:10, color:"#5A4A3A", marginBottom:4 }}>EMAIL</div><input className="input" placeholder="nom@email.com" value={f.email} onChange={e=>set("email",e.target.value)} /></div>
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <button className="btn btn-ghost" style={{ flex:1 }} onClick={onCancel}>Annuler</button>
        <button className="btn btn-teal" style={{ flex:2 }} onClick={()=>f.firstName&&f.lastName&&onSave(f)} disabled={!f.firstName||!f.lastName}>‚ú" Inscrire</button>
      </div>
    </div>
  );
}
