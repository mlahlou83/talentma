const NOMS_TRES_FORTS = ["benali","chraibi","el fassi","idrissi","tazi","berrada","mansouri","ouazzani","kettani","bensouda","lahlou","alaoui","benkirane","fassi","benbrahim","benjelloun","tahiri","zniber","filali","bennani","bennis","skalli","sebti","mernissi"]
const NOMS_FORTS = ["bouazza","rahimi","ziani","amrani","belhaj","saidi","moussaoui","cherkaoui","bouzidi","hajji","kabbaj","naciri","belghiti","ouali","benomar","boussaid","fennich","ghazi","hamdouch","laabid","lamrani","mechbal","naji","benabdallah"]
const NOMS_MOYENS = ["hassan","mohamed","ahmed","ali","omar","youssef","khalil","rachid","hamid","mustapha","driss","nabil","karim","amine","mehdi","samir","tariq","bilal","soufiane","imane","ghita","hajar","salma","nadia","rania","loubna"]
const PRENOMS_MA = ["mohammed","mohamed","youssef","amine","mehdi","karim","hamid","rachid","nadia","imane","fatima","khadija","zineb","salma","yasmine","loubna","rania","ghita","hajar","meryem","ibrahim","ilyas","omar","bilal","soufiane","tariq","driss","mustapha"]
const ECOLES_MAROC = ["mohammed v","um5","iscae","hec casablanca","hec rabat","emi","encg","esith","uir","hassan ii","cadi ayyad","inpt","ibn tofail","ensias","enset","abdelmalek","al akhawayn","aui","sidi mohamed","moulay ismail","enim"]
const EXP_MAROC = ["maroc","morocco","ocp","maroc telecom","attijariwafa","bmce","cih","banque populaire","wafa","oncf","royal air maroc","inwi","orange maroc","société générale maroc","casablanca","rabat","marrakech","fès","agadir","tanger","meknès","oujda","cdg","hps"]

export const DEFAULT_WEIGHTS = { nom_tres_fort:40, nom_fort:25, nom_moyen:15, prenom:10, ecole:25, experience:30 }

export function scoreProfile(p, weights = DEFAULT_WEIGHTS) {
  const nom = (p.lastName||'').toLowerCase()
  const prenom = (p.firstName||'').toLowerCase()
  const ecoles = (p.education||'').toLowerCase()
  const exp = (p.experience||'').toLowerCase()
  let score = 0; let signals = []
  if (NOMS_TRES_FORTS.some(n=>nom.includes(n)))    { score+=weights.nom_tres_fort; signals.push({label:'Nom très fort',pts:weights.nom_tres_fort,color:'#2ECC71'}) }
  else if (NOMS_FORTS.some(n=>nom.includes(n)))    { score+=weights.nom_fort;      signals.push({label:'Nom fort',pts:weights.nom_fort,color:'#F0B429'}) }
  else if (NOMS_MOYENS.some(n=>nom.includes(n)))   { score+=weights.nom_moyen;     signals.push({label:'Nom moyen',pts:weights.nom_moyen,color:'#E8963D'}) }
  if (PRENOMS_MA.some(n=>prenom.includes(n)))      { score+=weights.prenom;        signals.push({label:'Prénom MA',pts:weights.prenom,color:'#5BAFD6'}) }
  if (ECOLES_MAROC.some(e=>ecoles.includes(e)))    { score+=weights.ecole;         signals.push({label:'École Maroc',pts:weights.ecole,color:'#2ECC71'}) }
  if (EXP_MAROC.some(e=>exp.includes(e)))          { score+=weights.experience;    signals.push({label:'Exp. Maroc',pts:weights.experience,color:'#2ECC71'}) }
  const niveau = score>=80?'🟢 Très probable':score>=50?'🟡 Probable':score>=25?'🟠 Possible':'🔴 Incertain'
  return { ...p, score, signals, niveau }
}

export const PIPELINE_STAGES_DEFAULT = [
  { id:'nouveau',   label:'Nouveau',     color:'#5BAFD6', bg:'#0A1A28' },
  { id:'contacté',  label:'Contacté',    color:'#7F77DD', bg:'#16123A' },
  { id:'rappeler',  label:'À rappeler',  color:'#F0B429', bg:'#2D2000' },
  { id:'qualifié',  label:'Qualifié',    color:'#2ECC71', bg:'#0D3320' },
  { id:'présenté',  label:'Présenté',    color:'#0F6E56', bg:'#081A12' },
  { id:'placé',     label:'Placé ✓',     color:'#C8553D', bg:'#2D1000' },
]

export const CONTRACTS_DEFAULT = [
  { id:'freelance',  label:'Freelance',  color:'#0F6E56', bg:'#0A2018' },
  { id:'cdi_maroc',  label:'CDI Maroc',  color:'#BA7517', bg:'#1E1400' },
  { id:'cdi_france', label:'CDI France', color:'#185FA5', bg:'#0A1420' },
]

export const SKILLS_BY_DOMAIN = {
  Dev:['React','Vue.js','Node.js','Laravel','Python','TypeScript','Flutter','React Native','AWS','Docker','PHP','WordPress'],
  Design:['Figma','Adobe XD','Illustrator','Photoshop','Motion Design','Branding','Webflow','UI/UX'],
  Data:['Python','SQL','Power BI','Tableau','Machine Learning','R','Excel','NLP','BigQuery'],
  Marketing:['SEO','Google Ads','Facebook Ads','CRM','Copywriting','Analytics','Email Marketing'],
  Finance:['Excel','Sage','Comptabilité','Fiscalité','Audit','Contrôle de gestion','SAP'],
  Autre:[],
}

export const SAMPLE_PROFILES = [
  { id:1, firstName:'Karim',   lastName:'Ouazzani',  headline:'Dev Full Stack Freelance | React · Node.js', location:'Paris, France',    education:'Université Mohammed V Rabat, ISCAE', experience:'Société Générale Maroc, Capgemini', phone:'+33612345678', email:'k.ouazzani@email.com', linkedinUrl:'https://linkedin.com/in/kouazzani', contractType:'freelance', domain:'Dev', skills:['React','Node.js','TypeScript','AWS'], disponible:true, screened:true, screeningNote:'Excellent profil. React avancé. Recommandé.', marche:'france', pipelineStage:'qualifié', assignedTo:'Mohamed', callHistory:[], notes:[], rappelDate:'', scoreOverride:null },
  { id:2, firstName:'Yasmine', lastName:'Benali',    headline:'UX Designer Indépendante | Figma', location:'Lyon, France', education:'ISCAE Casablanca, École Nantes', experience:'Orange Maroc, Agence DDB Lyon', phone:'+33698765432', email:'y.benali@gmail.com', linkedinUrl:'https://linkedin.com/in/ybenali', contractType:'freelance', domain:'Design', skills:['Figma','Branding','Motion Design'], disponible:true, screened:true, screeningNote:'Portfolio solide. Recommandé.', marche:'france', pipelineStage:'contacté', assignedTo:'Mohamed', callHistory:[], notes:[], rappelDate:'', scoreOverride:null },
  { id:3, firstName:'Mehdi',   lastName:'Tazi',      headline:'Data Scientist · Consultant indépendant', location:'Toulouse, France', education:'HEC Paris', experience:'OCP Maroc, BNP Paribas', phone:'+33611223344', email:'m.tazi@outlook.com', linkedinUrl:'https://linkedin.com/in/mehtazi', contractType:'cdi_france', domain:'Data', skills:['Python','Machine Learning','SQL'], disponible:false, screened:true, screeningNote:'Profil senior. Visa talent en cours.', marche:'france', pipelineStage:'rappeler', assignedTo:'Collègue', callHistory:[], notes:[], rappelDate:'2026-04-05', scoreOverride:null },
  { id:4, firstName:'Amine',   lastName:'Berrada',   headline:'Dev Mobile React Native · Freelancer', location:'Casablanca, Maroc', education:'EMI Rabat', experience:'HPS Maroc, OCP Digital', phone:'+212661234567', email:'a.berrada@dev.ma', linkedinUrl:'https://linkedin.com/in/aberrada', contractType:'freelance', domain:'Dev', skills:['React Native','Flutter','TypeScript'], disponible:true, screened:false, screeningNote:'', marche:'maroc', pipelineStage:'nouveau', assignedTo:'Mohamed', callHistory:[], notes:[], rappelDate:'', scoreOverride:null },
  { id:5, firstName:'Rania',   lastName:'Kettani',   headline:'Data Analyst | Power BI · SQL', location:'Rabat, Maroc', education:'ISCAE Casablanca, ESSEC Paris', experience:'Attijariwafa Bank, McKinsey', phone:'+212662345678', email:'r.kettani@ma', linkedinUrl:'https://linkedin.com/in/rkettani', contractType:'cdi_maroc', domain:'Data', skills:['Power BI','SQL','Excel','Tableau'], disponible:true, screened:true, screeningNote:'Profil exceptionnel. Double culture.', marche:'maroc', pipelineStage:'placé', assignedTo:'Mohamed', callHistory:[], notes:[], rappelDate:'', scoreOverride:null },
]

export const DEFAULT_ADMIN_USERS = [
  { username:'Mohamed',  password:'talentma2026', role:'superadmin' },
  { username:'Collègue', password:'talent123',    role:'admin' },
]
