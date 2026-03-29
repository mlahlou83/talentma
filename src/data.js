export const DEFAULT_WEIGHTS = { nom_tres_fort:40, nom_fort:25, nom_moyen:15, prenom:10, ecole:25, experience:30 }

const NOMS_TRES_FORTS = ["benali","chraibi","idrissi","tazi","berrada","mansouri","ouazzani","kettani","lahlou","alaoui","fassi","benjelloun","filali","bennani"]
const NOMS_FORTS = ["bouazza","rahimi","ziani","amrani","belhaj","saidi","moussaoui","cherkaoui","hajji","kabbaj","naciri","belghiti","benomar"]
const NOMS_MOYENS = ["hassan","mohamed","ahmed","ali","omar","youssef","rachid","hamid","driss","nabil","karim","amine","mehdi","samir"]
const PRENOMS_MA = ["mohammed","mohamed","youssef","amine","mehdi","karim","hamid","rachid","nadia","imane","fatima","khadija","zineb","salma","yasmine","meryem","ibrahim","omar","bilal","driss","mustapha"]
const ECOLES_MAROC = ["mohammed v","um5","iscae","hec casablanca","hec rabat","emi","encg","uir","hassan ii","cadi ayyad","inpt","ibn tofail","ensias","al akhawayn","aui","enim"]
const EXP_MAROC = ["maroc","morocco","ocp","maroc telecom","attijariwafa","bmce","cih","banque populaire","wafa","oncf","royal air maroc","inwi","orange maroc","casablanca","rabat","marrakech","agadir","tanger","cdg","hps"]

export function scoreProfile(p, weights) {
  const w = weights || DEFAULT_WEIGHTS
  const nom = (p.lastName||'').toLowerCase()
  const prenom = (p.firstName||'').toLowerCase()
  const ecoles = (p.education||'').toLowerCase()
  const exp = (p.experience||'').toLowerCase()
  let score = 0
  if (NOMS_TRES_FORTS.some(n=>nom.includes(n))) score+=w.nom_tres_fort
  else if (NOMS_FORTS.some(n=>nom.includes(n))) score+=w.nom_fort
  else if (NOMS_MOYENS.some(n=>nom.includes(n))) score+=w.nom_moyen
  if (PRENOMS_MA.some(n=>prenom.includes(n))) score+=w.prenom
  if (ECOLES_MAROC.some(e=>ecoles.includes(e))) score+=w.ecole
  if (EXP_MAROC.some(e=>exp.includes(e))) score+=w.experience
  const niveau = score>=80?'Tres probable':score>=50?'Probable':score>=25?'Possible':'Incertain'
  return { ...p, score, niveau }
}

export const PIPELINE_STAGES_DEFAULT = [
  { id:'nouveau',   label:'Nouveau',    color:'#5BAFD6', bg:'#0A1A28' },
  { id:'contacte',  label:'Contacte',   color:'#7F77DD', bg:'#16123A' },
  { id:'rappeler',  label:'A rappeler', color:'#F0B429', bg:'#2D2000' },
  { id:'qualifie',  label:'Qualifie',   color:'#2ECC71', bg:'#0D3320' },
  { id:'presente',  label:'Presente',   color:'#0F6E56', bg:'#081A12' },
  { id:'place',     label:'Place',      color:'#C8553D', bg:'#2D1000' },
]

export const CONTRACTS_DEFAULT = [
  { id:'freelance',  label:'Freelance',  color:'#0F6E56', bg:'#0A2018' },
  { id:'cdi_maroc',  label:'CDI Maroc',  color:'#BA7517', bg:'#1E1400' },
  { id:'cdi_france', label:'CDI France', color:'#185FA5', bg:'#0A1420' },
]

export const SKILLS_BY_DOMAIN = {
  Dev:['React','Vue.js','Node.js','Laravel','Python','TypeScript','Flutter','React Native','AWS','Docker'],
  Design:['Figma','Adobe XD','Illustrator','Photoshop','Motion Design','Branding','Webflow','UI/UX'],
  Data:['Python','SQL','Power BI','Tableau','Machine Learning','Excel','R'],
  Marketing:['SEO','Google Ads','Facebook Ads','CRM','Copywriting','Analytics'],
  Finance:['Excel','Sage','Comptabilite','Fiscalite','Audit','SAP'],
  Autre:[],
}

export const DEFAULT_ADMIN_USERS = [
  { username:'Mohamed',  password:'talentma2026', role:'superadmin' },
  { username:'Collegue', password:'talent123',    role:'admin' },
]

export const SAMPLE_PROFILES = [
  { id:1, firstName:'Karim',   lastName:'Ouazzani',  headline:'Dev Full Stack Freelance | React Node.js', location:'Paris, France',    education:'Universite Mohammed V Rabat, ISCAE', experience:'Societe Generale Maroc, Capgemini', phone:'+33612345678', email:'k.ouazzani@email.com', contractType:'freelance', domain:'Dev', skills:['React','Node.js','TypeScript'], disponible:true, screened:true, screeningNote:'Excellent profil. React avance.', marche:'france', pipelineStage:'qualifie', assignedTo:'Mohamed', callHistory:[], notes:[], rappelDate:'', scoreOverride:null },
  { id:2, firstName:'Yasmine', lastName:'Benali',    headline:'UX Designer Independante | Figma', location:'Lyon, France', education:'ISCAE Casablanca', experience:'Orange Maroc, Agence DDB Lyon', phone:'+33698765432', email:'y.benali@gmail.com', contractType:'freelance', domain:'Design', skills:['Figma','Branding','UI/UX'], disponible:true, screened:true, screeningNote:'Portfolio solide.', marche:'france', pipelineStage:'contacte', assignedTo:'Mohamed', callHistory:[], notes:[], rappelDate:'', scoreOverride:null },
  { id:3, firstName:'Mehdi',   lastName:'Tazi',      headline:'Data Scientist Consultant', location:'Toulouse, France', education:'HEC Paris', experience:'OCP Maroc, BNP Paribas', phone:'+33611223344', email:'m.tazi@outlook.com', contractType:'cdi_france', domain:'Data', skills:['Python','Machine Learning','SQL'], disponible:false, screened:true, screeningNote:'Profil senior.', marche:'france', pipelineStage:'rappeler', assignedTo:'Collegue', callHistory:[], notes:[], rappelDate:'2026-04-05', scoreOverride:null },
  { id:4, firstName:'Amine',   lastName:'Berrada',   headline:'Dev Mobile React Native', location:'Casablanca, Maroc', education:'EMI Rabat', experience:'HPS Maroc, OCP Digital', phone:'+212661234567', email:'a.berrada@dev.ma', contractType:'freelance', domain:'Dev', skills:['React Native','Flutter','TypeScript'], disponible:true, screened:false, screeningNote:'', marche:'maroc', pipelineStage:'nouveau', assignedTo:'Mohamed', callHistory:[], notes:[], rappelDate:'', scoreOverride:null },
  { id:5, firstName:'Rania',   lastName:'Kettani',   headline:'Data Analyst | Power BI SQL', location:'Rabat, Maroc', education:'ISCAE Casablanca, ESSEC Paris', experience:'Attijariwafa Bank, McKinsey', phone:'+212662345678', email:'r.kettani@ma', contractType:'cdi_maroc', domain:'Data', skills:['Power BI','SQL','Excel','Tableau'], disponible:true, screened:true, screeningNote:'Profil exceptionnel.', marche:'maroc', pipelineStage:'place', assignedTo:'Mohamed', callHistory:[], notes:[], rappelDate:'', scoreOverride:null },
]
