import { useState, useMemo } from "react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0D0A06;color:#F0EDE8;font-family:'Syne',sans-serif}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#110D06}::-webkit-scrollbar-thumb{background:#3A2A18;border-radius:2px}
.btn{cursor:pointer;border:none;border-radius:8px;font-family:'Syne',sans-serif;font-weight:600;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
.btn-ghost{background:transparent;color:#7A6A5A;padding:7px 13px;font-size:12px;border:1px solid #2A1E12}.btn-ghost:hover{border-color:#C8553D;color:#C8553D}
.btn-accent{background:#C8553D;color:#fff;padding:8px 16px;font-size:12px}.btn-accent:hover{background:#E06040}
.card{background:#1A1008;border:1px solid #2A1E12;border-radius:12px}
.nav-tab{padding:7px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;border:1px solid transparent;transition:all .15s;font-family:'Syne',sans-serif}
.nav-tab.active{background:#C8553D;color:#fff;border-color:#C8553D}
.nav-tab:not(.active){color:#7A6A5A;border-color:#2A1E12}.nav-tab:not(.active):hover{border-color:#C8553D;color:#C8553D}
.slide-in{animation:si .2s ease}@keyframes si{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:4px;font-size:10px;font-family:'JetBrains Mono';font-weight:500}
`;

// ── DATA ──────────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

const REVENUE_DATA = [
  { month:"Jan", mrr:2990, new:1, churn:0, placements:2 },
  { month:"Fév", mrr:5980, new:2, churn:0, placements:3 },
  { month:"Mar", mrr:9770, new:2, churn:1, placements:5 },
  { month:"Avr", mrr:14550, new:3, churn:0, placements:7 },
  { month:"Mai", mrr:19330, new:3, churn:1, placements:8 },
  { month:"Jun", mrr:25310, new:4, churn:0, placements:11 },
];

const CLIENTS = [
  { id:1, company:"Acme Corp", plan:"Business", mrr:799, status:"active", requests:12, placements:3, joinedAt:"2026-01-15", lastActivity:"2026-03-28", sector:"Tech", marche:"france", contact:"Marie Dupont" },
  { id:2, company:"OCP Group", plan:"Enterprise", mrr:1999, status:"active", requests:34, placements:8, joinedAt:"2026-01-20", lastActivity:"2026-03-27", sector:"Industrie", marche:"maroc", contact:"Ahmed Benali" },
  { id:3, company:"Wafa Bank", plan:"Business", mrr:799, status:"active", requests:5, placements:1, joinedAt:"2026-02-10", lastActivity:"2026-03-20", sector:"Finance", marche:"maroc", contact:"Fatima Tazi" },
  { id:4, company:"StartupXYZ", plan:"Starter", mrr:299, status:"suspended", requests:3, placements:0, joinedAt:"2026-03-01", lastActivity:"2026-03-10", sector:"Tech", marche:"maroc", contact:"Omar Ziani" },
  { id:5, company:"Capgemini MA", plan:"Enterprise", mrr:1999, status:"active", requests:28, placements:6, joinedAt:"2026-02-01", lastActivity:"2026-03-28", sector:"ESN", marche:"both", contact:"Youssef Kettani" },
  { id:6, company:"BNP Paribas", plan:"Business", mrr:799, status:"pending", requests:0, placements:0, joinedAt:"2026-03-25", lastActivity:null, sector:"Finance", marche:"france", contact:"Sophie Martin" },
];

const PIPELINE = [
  { stage:"Prospect", count:8,  color:"#5BAFD6", bg:"#0A1A28" },
  { stage:"Démo",     count:5,  color:"#7F77DD", bg:"#16123A" },
  { stage:"Négoc.",   count:3,  color:"#F0B429", bg:"#2D2000" },
  { stage:"Signé",    count:2,  color:"#2ECC71", bg:"#0D3320" },
  { stage:"Actif",    count:5,  color:"#0F6E56", bg:"#081A12" },
  { stage:"Churned",  count:1,  color:"#E74C3C", bg:"#2D0D0D" },
];

const PLAN_CONFIG = { Starter:{ color:"#5BAFD6", price:299 }, Business:{ color:"#0F6E56", price:799 }, Enterprise:{ color:"#C8553D", price:1999 } };
const STATUS_CONFIG = { active:{ label:"Actif", color:"#2ECC71", bg:"#0D3320" }, suspended:{ label:"Suspendu", color:"#E74C3C", bg:"#2D0D0D" }, pending:{ label:"En attente", color:"#F0B429", bg:"#2D2000" } };

// ── MiniBar chart ─────────────────────────────────────────────────────────
function BarChart({ data, valueKey, color="#C8553D", height=80 }) {
  const max = Math.max(...data.map(d=>d[valueKey]));
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:4, height }}>
      {data.map((d,i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          <div style={{ width:"100%", background:`${color}30`, borderRadius:"3px 3px 0 0", position:"relative", height:height-16 }}>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, background:color, borderRadius:"3px 3px 0 0", height:`${max>0?(d[valueKey]/max)*100:0}%`, transition:"height .3s" }} />
          </div>
          <div style={{ fontSize:8, color:"#5A4A3A", fontFamily:"'JetBrains Mono'" }}>{d.month}</div>
        </div>
      ))}
    </div>
  );
}

// ── LineChart ──────────────────────────────────────────────────────────────
function LineChart({ data, valueKey, color="#C8553D", height=100 }) {
  const max = Math.max(...data.map(d=>d[valueKey]));
  const min = 0;
  const w=400, h=height;
  const pts = data.map((d,i)=>({
    x: (i/(data.length-1))*w,
    y: h - ((d[valueKey]-min)/(max-min||1))*(h-20) - 10,
    v: d[valueKey], m: d.month
  }));
  const pathD = pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width:"100%", height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${pathD} L${w},${h} L0,${h} Z`} fill={`url(#grad-${color.replace("#","")})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p,i)=>(
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={color} />
          <text x={p.x} y={p.y-8} textAnchor="middle" fontSize="9" fill="#7A6A5A" fontFamily="JetBrains Mono">{(p.v/1000).toFixed(1)}k</text>
        </g>
      ))}
    </svg>
  );
}

export default function DashboardCommercial() {
  const [period, setPeriod] = useState("6m");
  const [tab, setTab] = useState("overview");
  const [sortBy, setSortBy] = useState("mrr");

  const totalMRR = CLIENTS.filter(c=>c.status==="active").reduce((a,c)=>a+c.mrr,0);
  const totalARR = totalMRR * 12;
  const activeClients = CLIENTS.filter(c=>c.status==="active").length;
  const totalPlacements = CLIENTS.reduce((a,c)=>a+c.placements,0);
  const totalRequests = CLIENTS.reduce((a,c)=>a+c.requests,0);
  const convRate = totalRequests>0?Math.round((totalPlacements/totalRequests)*100):0;
  const avgMRR = activeClients>0?Math.round(totalMRR/activeClients):0;

  const sortedClients = useMemo(()=>[...CLIENTS].sort((a,b)=>{
    if(sortBy==="mrr") return b.mrr-a.mrr;
    if(sortBy==="requests") return b.requests-a.requests;
    if(sortBy==="placements") return b.placements-a.placements;
    return 0;
  }), [sortBy]);

  const planBreakdown = ["Starter","Business","Enterprise"].map(plan=>({
    plan, count:CLIENTS.filter(c=>c.plan===plan).length,
    mrr:CLIENTS.filter(c=>c.plan===plan&&c.status==="active").reduce((a,c)=>a+c.mrr,0),
    color:PLAN_CONFIG[plan].color
  }));

  const fmtMAD = n => n.toLocaleString("fr-FR")+" MAD";

  return (
    <div style={{ minHeight:"100vh", background:"#0D0A06" }}>
      <style>{css}</style>

      {/* NAV */}
      <div style={{ background:"#110D06", borderBottom:"1px solid #2A1E12", padding:"0 16px", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:960, margin:"0 auto", display:"flex", alignItems:"center", height:52, gap:10 }}>
          <div style={{ marginRight:"auto" }}>
            <div style={{ fontSize:14, fontWeight:800 }}>🇲🇦 TalentMA <span style={{ fontSize:10, color:"#C8553D" }}>Dashboard Commercial</span></div>
          </div>
          {["overview","clients","pipeline","revenus"].map(t=>(
            <button key={t} className={`nav-tab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
              {t==="overview"?"Vue globale":t==="clients"?"Clients":t==="pipeline"?"Pipeline":"Revenus"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"16px" }}>

        {/* ══ KPI BAND */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8, marginBottom:16 }}>
          {[
            ["MRR",fmtMAD(totalMRR),"#C8553D","Revenus mensuels récurrents"],
            ["ARR",fmtMAD(totalARR),"#F0B429","Revenus annuels projetés"],
            ["Clients actifs",activeClients,"#2ECC71","Comptes payants actifs"],
            ["Placements",totalPlacements,"#5BAFD6","Missions/CDI conclus"],
            ["Conversion",convRate+"%","#7F77DD","Demandes → Placements"],
            ["MRR moyen",fmtMAD(avgMRR),"#0F6E56","Par client actif"],
          ].map(([l,v,c,desc])=>(
            <div key={l} className="card" style={{ padding:"12px", textAlign:"center" }} title={desc}>
              <div style={{ fontSize:16, fontWeight:800, color:c, fontFamily:"'JetBrains Mono'", lineHeight:1.2, marginBottom:3 }}>{v}</div>
              <div style={{ fontSize:9, color:"#5A4A3A" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* ══ VUE GLOBALE */}
        {tab==="overview" && (
          <div className="slide-in">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>

              {/* MRR Chart */}
              <div className="card" style={{ padding:18 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>Évolution du MRR</div>
                <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:12 }}>6 derniers mois</div>
                <LineChart data={REVENUE_DATA} valueKey="mrr" color="#C8553D" height={100} />
              </div>

              {/* Placements Chart */}
              <div className="card" style={{ padding:18 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>Placements par mois</div>
                <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:12 }}>Missions et CDI signés</div>
                <BarChart data={REVENUE_DATA} valueKey="placements" color="#0F6E56" height={90} />
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
              {/* Plan breakdown */}
              <div className="card" style={{ padding:18 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Clients par offre</div>
                {planBreakdown.map(p=>(
                  <div key={p.plan} style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                      <span style={{ color:p.color, fontWeight:600 }}>{p.plan}</span>
                      <span style={{ fontFamily:"'JetBrains Mono'", color:"#7A6A5A" }}>{p.count} client{p.count>1?"s":""} · {fmtMAD(p.mrr)}</span>
                    </div>
                    <div style={{ height:5, background:"#1E1208", borderRadius:2 }}>
                      <div style={{ height:"100%", width:`${CLIENTS.length>0?(p.count/CLIENTS.length)*100:0}%`, background:p.color, borderRadius:2 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Top clients */}
              <div className="card" style={{ padding:18, gridColumn:"span 2" }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Top clients par MRR</div>
                {[...CLIENTS].filter(c=>c.status==="active").sort((a,b)=>b.mrr-a.mrr).slice(0,4).map(c=>{
                  const pc = PLAN_CONFIG[c.plan];
                  const maxMRR = Math.max(...CLIENTS.map(x=>x.mrr));
                  return (
                    <div key={c.id} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:`${pc.color}20`, border:`1px solid ${pc.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:pc.color, flexShrink:0 }}>
                        {c.company[0]}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                          <span style={{ fontSize:13, fontWeight:600 }}>{c.company}</span>
                          <span style={{ fontSize:12, color:pc.color, fontFamily:"'JetBrains Mono'", fontWeight:700 }}>{fmtMAD(c.mrr)}</span>
                        </div>
                        <div style={{ height:4, background:"#1E1208", borderRadius:2 }}>
                          <div style={{ height:"100%", width:`${(c.mrr/maxMRR)*100}%`, background:pc.color, borderRadius:2 }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ CLIENTS */}
        {tab==="clients" && (
          <div className="slide-in">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:13, color:"#7A6A5A" }}><b style={{ color:"#C8553D" }}>{CLIENTS.length}</b> comptes clients</div>
              <div style={{ display:"flex", gap:8 }}>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ background:"#110D06", border:"1px solid #2A1E12", borderRadius:8, padding:"6px 12px", color:"#F0EDE8", fontSize:12, fontFamily:"'Syne'", outline:"none", cursor:"pointer" }}>
                  <option value="mrr">Trier par MRR</option>
                  <option value="requests">Trier par demandes</option>
                  <option value="placements">Trier par placements</option>
                </select>
              </div>
            </div>

            <div className="card">
              {/* Header */}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr", gap:8, padding:"10px 14px", borderBottom:"1px solid #2A1E12", fontSize:10, color:"#5A4A3A", fontWeight:700 }}>
                <span>SOCIÉTÉ</span><span>OFFRE</span><span>MRR</span><span>DEMANDES</span><span>PLACEMENTS</span><span>STATUT</span>
              </div>
              {sortedClients.map(c=>{
                const pc = PLAN_CONFIG[c.plan] || { color:"#888", price:0 };
                const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
                const convR = c.requests>0?Math.round((c.placements/c.requests)*100):0;
                return (
                  <div key={c.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr", gap:8, padding:"12px 14px", borderBottom:"1px solid #2A1E12", alignItems:"center" }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13 }}>{c.company}</div>
                      <div style={{ fontSize:11, color:"#5A4A3A" }}>{c.sector} · {c.contact} · Depuis {c.joinedAt}</div>
                    </div>
                    <span className="tag" style={{ background:`${pc.color}20`, color:pc.color, border:`1px solid ${pc.color}40` }}>{c.plan}</span>
                    <span style={{ fontFamily:"'JetBrains Mono'", fontSize:13, color:"#C8553D", fontWeight:700 }}>{fmtMAD(c.mrr)}</span>
                    <span style={{ fontSize:13 }}>{c.requests}</span>
                    <div>
                      <div style={{ fontSize:13 }}>{c.placements}</div>
                      <div style={{ fontSize:10, color:"#5A4A3A" }}>{convR}% conv.</div>
                    </div>
                    <span className="tag" style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.color}40` }}>● {sc.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ PIPELINE */}
        {tab==="pipeline" && (
          <div className="slide-in">
            <div style={{ fontSize:13, color:"#7A6A5A", marginBottom:14 }}>
              Suivi du pipeline commercial — prospects → clients actifs
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10, marginBottom:20 }}>
              {PIPELINE.map(s=>(
                <div key={s.stage} className="card" style={{ padding:16, textAlign:"center", borderTop:`3px solid ${s.color}` }}>
                  <div style={{ fontSize:28, fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono'", marginBottom:4 }}>{s.count}</div>
                  <div style={{ fontSize:11, color:"#7A6A5A" }}>{s.stage}</div>
                </div>
              ))}
            </div>

            {/* Funnel visualization */}
            <div className="card" style={{ padding:20, marginBottom:14 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Entonnoir commercial</div>
              {PIPELINE.map((s,i)=>{
                const maxCount = Math.max(...PIPELINE.map(x=>x.count));
                const pct = Math.round((s.count/maxCount)*100);
                return (
                  <div key={s.stage} style={{ marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                      <span style={{ color:"#7A6A5A" }}>{s.stage}</span>
                      <span style={{ color:s.color, fontFamily:"'JetBrains Mono'", fontWeight:700 }}>{s.count} compte{s.count>1?"s":""}</span>
                    </div>
                    <div style={{ height:28, background:"#110D06", borderRadius:6, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:s.bg, borderLeft:`3px solid ${s.color}`, display:"flex", alignItems:"center", paddingLeft:8, transition:"width .3s" }}>
                        <span style={{ fontSize:10, color:s.color, fontWeight:700 }}>{pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Objectifs du mois */}
            <div className="card" style={{ padding:20 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Objectifs avril 2026</div>
              {[
                ["Nouveaux clients signés","2 / 4","#C8553D",50],
                ["Démos planifiées","3 / 5","#F0B429",60],
                ["MRR additionnel","3 198 MAD / 6 000 MAD","#2ECC71",53],
                ["Taux de conversion","18% / 25%","#7F77DD",72],
              ].map(([l,v,c,pct])=>(
                <div key={l} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
                    <span style={{ color:"#7A6A5A" }}>{l}</span>
                    <span style={{ color:c, fontWeight:700 }}>{v}</span>
                  </div>
                  <div style={{ height:5, background:"#1E1208", borderRadius:3 }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:c, borderRadius:3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ REVENUS */}
        {tab==="revenus" && (
          <div className="slide-in">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div className="card" style={{ padding:18 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>MRR mensuel</div>
                <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:12 }}>Revenus récurrents mensuels</div>
                <LineChart data={REVENUE_DATA} valueKey="mrr" color="#C8553D" height={110} />
              </div>
              <div className="card" style={{ padding:18 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>Nouveaux clients</div>
                <div style={{ fontSize:11, color:"#5A4A3A", marginBottom:12 }}>Acquisitions mensuelles</div>
                <BarChart data={REVENUE_DATA} valueKey="new" color="#0F6E56" height={100} />
              </div>
            </div>

            <div className="card" style={{ padding:18 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Détail mensuel</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", gap:0 }}>
                {["MOIS","MRR","NOUVEAUX","CHURN","PLACEMENTS"].map(h=>(
                  <div key={h} style={{ padding:"8px 12px", background:"#110D06", fontSize:10, color:"#5A4A3A", fontWeight:700 }}>{h}</div>
                ))}
                {REVENUE_DATA.map((d,i)=>[d.month, `${d.mrr.toLocaleString("fr-FR")} MAD`, `+${d.new}`, `-${d.churn}`, d.placements].map((v,j)=>(
                  <div key={`${i}-${j}`} style={{ padding:"10px 12px", background:i%2===0?"#1A1008":"#110D06", fontSize:12, fontFamily:j>0?"'JetBrains Mono'":"'Syne'", color:j===1?"#C8553D":j===2?"#2ECC71":j===3?"#E74C3C":"#F0EDE8", fontWeight:j===1?700:400 }}>{v}</div>
                )))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
