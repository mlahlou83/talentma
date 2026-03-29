import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { load, save } from "../storage";
import { scoreProfile, DEFAULT_WEIGHTS, PIPELINE_STAGES_DEFAULT, CONTRACTS_DEFAULT, SAMPLE_PROFILES } from "../data";
import AdminNav from "../components/AdminNav";

const isOverdue = p => p.rappelDate && p.pipelineStage === "rappeler" && new Date(p.rappelDate) < new Date();
const fmtDate = d => d ? new Date(d).toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", year:"2-digit" }) : "";

function ScoreBadge({ score, niveau }) {
  const c = niveau && niveau.includes("probable") ? "#2ECC71" : niveau && niveau.includes("Probable") ? "#F0B429" : niveau && niveau.includes("Possible") ? "#E8963D" : "#E74C3C";
  const bg = niveau && niveau.includes("probable") ? "#0D3320" : niveau && niveau.includes("Probable") ? "#2D2000" : niveau && niveau.includes("Possible") ? "#2D1500" : "#2D0D0D";
  return React.createElement("span", { style: { display:"inline-flex", padding:"2px 8px", borderRadius:4, fontSize:10, fontFamily:"monospace", background:bg, color:c, border:"1px solid "+c+"40" } }, score+"pts");
}

import React from "react";

export default function AdminCRM() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [stages] = useState(PIPELINE_STAGES_DEFAULT);
  const [contracts] = useState(CONTRACTS_DEFAULT);
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("Tous");
  const [filterOverdue, setFilterOverdue] = useState(false);

  useEffect(() => {
    load("session").then(s => { if (!s) { navigate("/admin"); return; } setSession(s); });
    load("tm-profiles").then(p => {
      if (p && p.length) setProfiles(p.map(x => scoreProfile(x, DEFAULT_WEIGHTS)));
      else {
        const sc = SAMPLE_PROFILES.map(x => scoreProfile(x, DEFAULT_WEIGHTS));
        setProfiles(sc);
        save("tm-profiles", sc);
      }
    });
  }, []);

  const persist = useCallback(async p => { setProfiles(p); await save("tm-profiles", p); }, []);

  const overdueCount = useMemo(() => profiles.filter(isOverdue).length, [profiles]);

  const filtered = useMemo(() => profiles.filter(p => {
    const q = search.toLowerCase();
    return (!q || (p.firstName+" "+p.lastName+" "+p.headline).toLowerCase().includes(q))
      && (filterStage === "Tous" || p.pipelineStage === filterStage)
      && (!filterOverdue || isOverdue(p));
  }).sort((a,b) => (b.score||0) - (a.score||0)), [profiles, search, filterStage, filterOverdue]);

  const stats = useMemo(() => ({
    total: profiles.length,
    dispo: profiles.filter(p=>p.disponible).length,
    certified: profiles.filter(p=>p.screened).length,
    overdue: overdueCount,
    placed: profiles.filter(p=>p.pipelineStage==="place").length,
    stageBreak: stages.map(s => ({ ...s, count: profiles.filter(p=>p.pipelineStage===s.id).length })),
  }), [profiles, overdueCount, stages]);

  const inp = { background:"#110D06", border:"1px solid #2A1E12", borderRadius:8, padding:"9px 13px", color:"#F0EDE8", fontFamily:"inherit", fontSize:13, outline:"none" };

  if (!session) return React.createElement("div", { style:{minHeight:"100vh",background:"#0D0A06",display:"flex",alignItems:"center",justifyContent:"center",color:"#5A4A3A"} }, "Chargement...");

  return React.createElement("div", { style:{minHeight:"100vh",background:"#0D0A06",fontFamily:"'Syne',sans-serif",color:"#F0EDE8"} },
    React.createElement(AdminNav, { session }),
    React.createElement("div", { style:{maxWidth:900,margin:"0 auto",padding:"14px 16px"} },

      // Stats
      React.createElement("div", { style:{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:12} },
        [["Total",stats.total,"#F0EDE8"],["Dispos",stats.dispo,"#2ECC71"],["Certifies",stats.certified,"#F0B429"],["Places",stats.placed,"#C8553D"],["Retard",stats.overdue,"#E74C3C"]].map(([l,v,c]) =>
          React.createElement("div", { key:l, style:{background:"#1A1008",border:"1px solid #2A1E12",borderRadius:12,padding:"8px",textAlign:"center"} },
            React.createElement("div", { style:{fontSize:18,fontWeight:800,color:c,fontFamily:"monospace"} }, v),
            React.createElement("div", { style:{fontSize:9,color:"#5A4A3A"} }, l)
          )
        )
      ),

      // Pipeline bar
      React.createElement("div", { style:{display:"flex",gap:4,marginBottom:12} },
        stats.stageBreak.map(s =>
          React.createElement("div", { key:s.id, onClick:()=>setFilterStage(filterStage===s.id?"Tous":s.id), title:s.label,
            style:{flex:s.count||0.3,height:20,background:filterStage===s.id?s.color:s.bg,border:"1px solid "+s.color+"40",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",minWidth:24} },
            React.createElement("span", { style:{fontSize:9,color:filterStage===s.id?"#fff":s.color,fontWeight:700,fontFamily:"monospace"} }, s.count)
          )
        )
      ),

      // Search
      React.createElement("div", { style:{background:"#110D06",borderRadius:12,padding:12,marginBottom:12} },
        React.createElement("input", { style:{...inp,width:"100%",marginBottom:8}, placeholder:"Rechercher...", value:search, onChange:e=>setSearch(e.target.value) }),
        React.createElement("div", { style:{display:"flex",gap:8,flexWrap:"wrap"} },
          React.createElement("select", { style:{...inp,flex:"1 1 120px",cursor:"pointer",appearance:"none"}, value:filterStage, onChange:e=>setFilterStage(e.target.value) },
            React.createElement("option", { value:"Tous" }, "Toutes etapes"),
            ...stages.map(s => React.createElement("option", { key:s.id, value:s.id }, s.label))
          ),
          React.createElement("button", { onClick:()=>setFilterOverdue(!filterOverdue),
            style:{...inp,cursor:"pointer",borderColor:filterOverdue?"#E74C3C":"#2A1E12",color:filterOverdue?"#E74C3C":"#7A6A5A",width:"auto"} },
            "Retards "+overdueCount
          )
        )
      ),

      // Results count
      React.createElement("div", { style:{fontSize:12,color:"#5A4A3A",marginBottom:12} },
        React.createElement("b", { style:{color:"#C8553D"} }, filtered.length), " profil"+(filtered.length>1?"s":"")
      ),

      // List
      React.createElement("div", { style:{display:"flex",flexDirection:"column",gap:10} },
        filtered.length === 0
          ? React.createElement("div", { style:{textAlign:"center",padding:"50px 0",color:"#5A4A3A"} }, "Aucun profil")
          : filtered.map((p,i) => {
              const c = contracts.find(c=>c.id===p.contractType) || {label:"--",color:"#888",bg:"#222"};
              const stage = stages.find(s=>s.id===p.pipelineStage) || stages[0];
              return React.createElement("div", { key:p.id,
                style:{background:"#1A1008",border:"1px solid #2A1E12",borderRadius:12,padding:"13px 15px",borderLeft:"3px solid "+(isOverdue(p)?"#E74C3C":stage&&stage.color||"#2A1E12"),cursor:"pointer"} },
                React.createElement("div", { style:{display:"flex",gap:10,alignItems:"flex-start"} },
                  React.createElement("div", { style:{width:36,height:36,borderRadius:9,background:c.color+"20",border:"1px solid "+c.color+"40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:c.color,flexShrink:0} },
                    (p.firstName||"?")[0]+(p.lastName||"?")[0]
                  ),
                  React.createElement("div", { style:{flex:1,minWidth:0} },
                    React.createElement("div", { style:{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:3} },
                      React.createElement("span", { style:{fontWeight:700,fontSize:13} }, p.firstName+" "+p.lastName),
                      React.createElement("span", { style:{display:"inline-flex",padding:"2px 8px",borderRadius:4,fontSize:10,fontFamily:"monospace",background:(p.niveau&&p.niveau.includes("probable"))?"#0D3320":(p.niveau&&p.niveau.includes("Probable"))?"#2D2000":"#2D1500",color:(p.niveau&&p.niveau.includes("probable"))?"#2ECC71":(p.niveau&&p.niveau.includes("Probable"))?"#F0B429":"#E8963D"} }, (p.score||0)+"pts"),
                      stage && React.createElement("span", { style:{display:"inline-flex",padding:"2px 8px",borderRadius:4,fontSize:10,fontFamily:"monospace",background:stage.bg,color:stage.color,border:"1px solid "+stage.color+"40"} }, stage.label)
                    ),
                    React.createElement("div", { style:{fontSize:11,color:"#7A6A5A",marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"} }, p.headline),
                    React.createElement("div", { style:{display:"flex",gap:8,flexWrap:"wrap",fontSize:10,color:"#5A4A3A"} },
                      React.createElement("span", null, p.location),
                      React.createElement("span", { style:{display:"inline-flex",padding:"2px 8px",borderRadius:4,fontFamily:"monospace",background:c.bg,color:c.color,border:"1px solid "+c.color+"40"} }, c.label),
                      p.screened && React.createElement("span", { style:{color:"#2ECC71"} }, "Certifie"),
                      React.createElement("span", null, "Assigne: "+p.assignedTo)
                    ),
                    (p.skills||[]).length>0 && React.createElement("div", { style:{display:"flex",gap:5,flexWrap:"wrap",marginTop:5} },
                      (p.skills||[]).slice(0,5).map(s => React.createElement("span", { key:s, style:{fontSize:10,padding:"2px 7px",borderRadius:4,fontFamily:"monospace",background:"#1E1208",color:"#7A6A5A",border:"1px solid #2A1E12"} }, s))
                    )
                  ),
                  p.phone && React.createElement("a", { href:"https://wa.me/"+p.phone.replace(/\D/g,""), target:"_blank", rel:"noreferrer",
                    style:{background:"#25D366",color:"#fff",border:"none",borderRadius:8,padding:"7px 11px",fontSize:11,cursor:"pointer",flexShrink:0,textDecoration:"none"} }, "WA")
                )
              );
            })
      )
    )
  );
}
