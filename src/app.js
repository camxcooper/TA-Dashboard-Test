/* --- TA Dashboard Application --- */

const App = (() => {

  let state = {
    persona: "vpta",
    section: "overview",
    reqFilter: { team:"all", priority:"all", search:"" },
    drawerOpen: false,
    paletteOpen: false,
    animatedOnce: new Set(),
  };

  const PERSONA_CONFIG = {
    vpta:   { spotlightKPIs:["openReqs","activeInPipeline","avgTTH","offerAcceptance","recruiterLoad","hiredYTD"],         pinnedAlerts:[1,2,3],   accentColor:"#818CF8", defaultSection:"overview"  },
    cpo:    { spotlightKPIs:["hiredYTD","headcountGap","diversionRate","offerAcceptance","avgTTH","costPerHire"],         pinnedAlerts:[1,6],     accentColor:"#34D399", defaultSection:"overview"  },
    evpeng: { spotlightKPIs:["openReqs","hiredYTD","headcountGap","interviewHours","avgTTH","offerAcceptance"],          pinnedAlerts:[2,5],     accentColor:"#FB923C", defaultSection:"headcount" },
    direng: { spotlightKPIs:["openReqs","activeInPipeline","interviewHours","offerAcceptance","avgTTH","hiredYTD"],      pinnedAlerts:[2,5],     accentColor:"#F472B6", defaultSection:"pipeline"  },
    cto:    { spotlightKPIs:["hiredYTD","openReqs","avgTTH","diversionRate","offerAcceptance","headcountGap"],           pinnedAlerts:[1,2],     accentColor:"#60A5FA", defaultSection:"overview"  },
    dirfpa: { spotlightKPIs:["costPerHire","agencySpend","hcBudgetBurn","hiredYTD","headcountGap","openReqs"],           pinnedAlerts:[4],       accentColor:"#FBBF24", defaultSection:"finance"   },
  };

  const NAV_ITEMS = [
    {id:"overview",   icon:"◈", label:"Overview"    },
    {id:"pipeline",   icon:"⋮", label:"Pipeline"    },
    {id:"headcount",  icon:"▦", label:"Headcount"   },
    {id:"reqs",       icon:"☰", label:"Open Reqs"   },
    {id:"sourcing",   icon:"◎", label:"Sourcing"    },
    {id:"performance",icon:"▲", label:"Performance" },
    {id:"team",       icon:"⬡", label:"Team Load"   },
    {id:"finance",    icon:"$",      label:"Finance"     },
    {id:"dei",        icon:"◑", label:"Inclusion"   },
  ];

  const $ = id => document.getElementById(id);
  const qs = sel => document.querySelector(sel);
  const qsa = sel => document.querySelectorAll(sel);

  function fmt(n, unit="") {
    if(unit==="$"){
      if(n>=1000000) return "$"+(n/1000000).toFixed(1)+"M";
      if(n>=1000) return "$"+(n/1000).toFixed(0)+"K";
      return "$"+n;
    }
    return n>=1000?n.toLocaleString():n;
  }

  function animateCount(el, target, duration=800, prefix="", suffix="") {
    const start=performance.now();
    function tick(now){
      const p=Math.min(1,(now-start)/duration);
      const ease=1-Math.pow(1-p,3);
      const v=target*ease;
      el.textContent=prefix+(target%1===0?Math.round(v).toLocaleString():v.toFixed(1))+suffix;
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function renderShell(){
    document.body.innerHTML=`
      <div class="app" id="app">
        ${renderSidebar()}
        <div class="main-area">
          ${renderTopbar()}
          <div class="page-content" id="page-content"></div>
        </div>
      </div>
      ${renderDrawer()}
      ${renderCommandPalette()}
      <div class="tooltip" id="tooltip"></div>
    `;
    bindGlobalEvents();
  }

  function renderSidebar(){
    return `<aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-mark">M</div>
        <div class="logo-text"><span class="logo-name">Meridian</span><span class="logo-sub">Talent Intelligence</span></div>
      </div>
      <nav class="sidebar-nav" id="sidebar-nav">
        ${NAV_ITEMS.map(n=>`<a href="#" class="nav-item ${n.id===state.section?'active':''}" data-section="${n.id}"><span class="nav-icon">${n.icon}</span><span class="nav-label">${n.label}</span></a>`).join("")}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-cmd-hint" id="open-palette"><span class="cmd-key">⌘K</span><span>Command palette</span></div>
      </div>
    </aside>`;
  }

  function renderTopbar(){
    const d=TA_DATA,alertCount=getPersonaAlerts().length;
    return `<header class="topbar" id="topbar">
      <div class="topbar-left">
        <h1 class="page-title" id="page-title">${sectionTitle()}</h1>
        <span class="last-updated">${d.meta.lastUpdated}</span>
      </div>
      <div class="topbar-center">
        <div class="persona-switcher" id="persona-switcher">
          ${d.personas.map(p=>`<button class="persona-pill ${p.id===state.persona?'active':''}" data-persona="${p.id}" style="${p.id===state.persona?`--pill-color:${p.color}`:''}"> ${p.abbr}</button>`).join("")}
        </div>
      </div>
      <div class="topbar-right">
        <div class="search-trigger" id="search-trigger"><span class="search-icon">⌕</span><span class="search-placeholder">Search reqs, people...</span><span class="search-kbd">⌘K</span></div>
        <button class="alert-btn ${alertCount>0?'has-alerts':''}" id="alert-btn"><span class="alert-icon">🔔</span>${alertCount>0?`<span class="alert-badge">${alertCount}</span>`:""}</button>
        <div class="user-avatar" title="Your account">JD</div>
      </div>
    </header>`;
  }

  function renderDrawer(){
    return `<div class="drawer-backdrop" id="drawer-backdrop"></div>
    <div class="drawer" id="drawer">
      <div class="drawer-header"><h2 class="drawer-title" id="drawer-title">Details</h2><button class="drawer-close" id="drawer-close">✕</button></div>
      <div class="drawer-body" id="drawer-body"></div>
    </div>`;
  }

  function renderCommandPalette(){
    return `<div class="palette-overlay" id="palette-overlay">
      <div class="palette">
        <div class="palette-input-wrap"><span class="palette-search-icon">⌕</span><input type="text" class="palette-input" id="palette-input" placeholder="Search reqs, people, sections..."><span class="palette-esc">esc</span></div>
        <div class="palette-results" id="palette-results"></div>
      </div>
    </div>`;
  }

  function sectionTitle(){
    const map={overview:"Overview",pipeline:"Pipeline",headcount:"Headcount Plan",reqs:"Open Requisitions",sourcing:"Sourcing",performance:"Performance",team:"Team Load",finance:"Finance & Budget",dei:"Inclusion & Diversity"};
    return map[state.section]||"Overview";
  }

  function navigateTo(section){
    state.section=section;
    $('page-title').textContent=sectionTitle();
    qsa('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.section===section));
    renderSection();
    closeDrawer();
  }

  function renderSection(){
    const content=$('page-content');
    content.classList.add('transitioning');
    setTimeout(()=>{
      const renders={overview:renderOverview,pipeline:renderPipeline,headcount:renderHeadcount,reqs:renderReqs,sourcing:renderSourcing,performance:renderPerformance,team:renderTeam,finance:renderFinance,dei:renderDEI};
      content.innerHTML=(renders[state.section]||renderOverview)();
      content.classList.remove('transitioning');
      bindSectionEvents();
      renderCharts();
    },120);
  }

  function renderOverview(){
    const cfg=PERSONA_CONFIG[state.persona];
    const kpis=cfg.spotlightKPIs.map(k=>({key:k,...TA_DATA.kpis[k]}));
    const alerts=getPersonaAlerts();
    return `
      <div class="section-header">
        <div class="section-filters">
          <button class="filter-chip active">Q2 2026</button>
          <button class="filter-chip">All Teams</button>
          <button class="filter-chip">All Levels</button>
        </div>
        <button class="action-btn primary" onclick="App.openAlerts()">${alerts.length>0?`<span class="btn-badge">${alerts.length}</span>`:""} Alerts & Actions</button>
      </div>
      ${alerts.length>0?`<div class="alert-strip">${alerts.slice(0,2).map(a=>`<div class="alert-item alert-${a.type}"><span class="alert-dot"></span><div class="alert-content"><span class="alert-title">${a.title}</span><span class="alert-detail">${a.detail}</span></div><button class="alert-dismiss" data-alert-id="${a.id}">✕</button></div>`).join("")}</div>`:""}
      <div class="kpi-grid">${kpis.map((k,i)=>renderKPICard(k,cfg.accentColor,i)).join("")}</div>
      <div class="charts-grid">
        <div class="chart-card span-2"><div class="chart-card-header"><div><h3 class="chart-title">Hiring Funnel</h3><p class="chart-subtitle">All teams · This quarter</p></div><div class="chart-actions">${['All',...Object.keys(TA_DATA.pipeline.byTeam).slice(0,4)].map((t,i)=>`<button class="chart-action-btn ${i===0?'active':''}" data-funnel-view="${t}">${t.slice(0,3)}</button>`).join("")}</div></div><div class="chart-body"><div id="chart-funnel" class="chart-area funnel-area"></div></div></div>
        <div class="chart-card"><div class="chart-card-header"><div><h3 class="chart-title">Time-to-Hire Trend</h3><p class="chart-subtitle">Days · Rolling 7 months</p></div></div><div class="chart-body"><div id="chart-tth" class="chart-area"></div></div><div class="chart-legend" id="legend-tth"></div></div>
        <div class="chart-card"><div class="chart-card-header"><div><h3 class="chart-title">Offer Acceptance</h3><p class="chart-subtitle">Rate by team</p></div></div><div class="chart-body donut-body"><div id="chart-donut" class="chart-area"></div><div class="donut-legend" id="legend-donut"></div></div></div>
        <div class="chart-card span-2"><div class="chart-card-header"><div><h3 class="chart-title">Headcount vs Plan</h3><p class="chart-subtitle">By team · Hired + Pipeline vs Target</p></div></div><div class="chart-body"><div id="chart-headcount" class="chart-area"></div></div></div>
        <div class="chart-card"><div class="chart-card-header"><div><h3 class="chart-title">Source Effectiveness</h3><p class="chart-subtitle">Hires by source</p></div></div><div class="chart-body"><div id="chart-source" class="chart-area"></div></div></div>
      </div>`;
  }

  function renderKPICard(kpi,accentColor,index){
    const isPos=(kpi.trend==="up"&&kpi.delta>0)||(kpi.trend==="down"&&kpi.delta<0);
    const prefix=kpi.unit==="$"?"$":"";
    const suffix=kpi.unit==="%"?"%":kpi.unit==="days"?"d":"";
    let dv=kpi.value;
    if(kpi.unit==="$"&&kpi.value>=1000) dv=kpi.value>=1000000?(kpi.value/1000000).toFixed(1)+"M":(kpi.value/1000).toFixed(0)+"K";
    return `<div class="kpi-card" data-kpi="${kpi.key}" style="--accent:${accentColor};animation-delay:${index*60}ms">
      <div class="kpi-header"><span class="kpi-label">${kpi.label}</span><span class="kpi-trend ${isPos?'positive':'negative'}">${kpi.trend==="up"?"↑":"↓"} ${kpi.delta>0?"+":""}${Math.abs(kpi.delta)}${kpi.unit==="%"?"pp":""}</span></div>
      <div class="kpi-value" data-animate="${kpi.value}" data-prefix="${prefix}" data-suffix="${suffix}">${prefix}${typeof dv==="string"?dv:dv.toLocaleString()}${suffix}</div>
      <div class="kpi-sparkline" data-sparkline='${JSON.stringify(kpi.sparkline)}' data-color="${accentColor}"></div>
    </div>`;
  }

  function renderPipeline(){
    const stages=TA_DATA.pipeline.stages,byTeam=TA_DATA.pipeline.byTeam;
    return `<div class="section-header"><div class="section-filters"><select class="filter-select" id="pipeline-team-filter"><option value="all">All Teams</option>${Object.keys(byTeam).map(t=>`<option>${t}</option>`).join("")}</select></div></div>
    <div class="charts-grid">
      <div class="chart-card span-3"><div class="chart-card-header"><div><h3 class="chart-title">Full Pipeline Funnel</h3><p class="chart-subtitle">${stages[0].count.toLocaleString()} total · ${stages[stages.length-1].count} hired</p></div><div class="funnel-summary"><span class="funnel-stat">Overall conv: <strong>${((stages[stages.length-1].count/stages[0].count)*100).toFixed(1)}%</strong></span><span class="funnel-stat">Cycle: <strong>${stages.reduce((s,st)=>s+st.avgDays,0)}d</strong></span></div></div><div class="chart-body"><div id="chart-funnel-full" class="chart-area funnel-area"></div></div></div>
      <div class="chart-card span-2"><div class="chart-card-header"><div><h3 class="chart-title">Pipeline by Team</h3><p class="chart-subtitle">Stage breakdown</p></div></div><div class="chart-body"><div id="chart-pipeline-team" class="chart-area"></div></div></div>
      <div class="chart-card"><div class="chart-card-header"><div><h3 class="chart-title">Stage Conversion</h3><p class="chart-subtitle">Pass-through rates</p></div></div><div class="chart-body"><div id="chart-conversion" class="chart-area"></div></div></div>
    </div>`;
  }

  function renderHeadcount(){
    const teams=TA_DATA.headcount.teams;
    return `<div class="section-header">
      <div class="section-filters"><button class="filter-chip active">FY2026 Plan</button><button class="filter-chip">Q2 Only</button></div>
      <div class="hc-summary-strip">
        <div class="hc-summary-item"><span class="hc-s-val">${teams.reduce((s,t)=>s+t.plan,0)}</span><span class="hc-s-lbl">Plan</span></div>
        <div class="hc-summary-item positive"><span class="hc-s-val">${teams.reduce((s,t)=>s+t.hired,0)}</span><span class="hc-s-lbl">Hired</span></div>
        <div class="hc-summary-item warning"><span class="hc-s-val">${teams.reduce((s,t)=>s+t.pipeline,0)}</span><span class="hc-s-lbl">In Pipe</span></div>
        <div class="hc-summary-item negative"><span class="hc-s-val">${teams.reduce((s,t)=>s+t.gap,0)}</span><span class="hc-s-lbl">Gap</span></div>
      </div>
    </div>
    <div class="hc-team-table">
      <div class="hc-table-header"><span>Team</span><span>Plan</span><span>Hired</span><span>Pipeline</span><span>Gap</span><span>Progress</span><span>Avg Comp</span></div>
      ${teams.map(t=>{
        const pct=Math.round(((t.hired+t.pipeline)/t.plan)*100),hpct=Math.round((t.hired/t.plan)*100);
        return `<div class="hc-table-row" onclick="App.openTeamDrill('${t.team}')">
          <span class="hc-team-name">${t.team}</span><span class="hc-num">${t.plan}</span>
          <span class="hc-num positive">${t.hired}</span><span class="hc-num warning">${t.pipeline}</span>
          <span class="hc-num ${t.gap>0?'negative':'positive'}">${t.gap>0?t.gap:'✓'}</span>
          <span class="hc-progress-cell"><div class="hc-progress-bar"><div class="hc-progress-hired" style="width:${hpct}%"></div><div class="hc-progress-pipe" style="width:${Math.min(pct-hpct,100-hpct)}%;left:${hpct}%"></div></div><span class="hc-pct">${pct}%</span></span>
          <span class="hc-comp">$${(t.avgComp/1000).toFixed(0)}K</span>
        </div>`;
      }).join("")}
    </div>
    <div class="charts-grid" style="margin-top:24px">
      <div class="chart-card span-2"><div class="chart-card-header"><div><h3 class="chart-title">Quarterly Hiring vs Plan</h3><p class="chart-subtitle">Planned vs actual per quarter</p></div></div><div class="chart-body"><div id="chart-quarterly" class="chart-area"></div></div><div class="chart-legend"><span class="legend-item"><span class="legend-dot" style="background:#818CF8"></span>Planned</span><span class="legend-item"><span class="legend-dot" style="background:#34D399"></span>Actual</span></div></div>
      <div class="chart-card"><div class="chart-card-header"><div><h3 class="chart-title">HC by Team</h3><p class="chart-subtitle">Hired share</p></div></div><div class="chart-body"><div id="chart-hc-donut" class="chart-area donut-area"></div></div></div>
    </div>`;
  }

  function renderReqs(){
    return `<div class="section-header reqs-header">
      <div class="section-filters">
        <div class="search-box"><span class="search-box-icon">⌕</span><input type="text" class="search-box-input" id="req-search" placeholder="Search reqs..." value="${state.reqFilter.search}"></div>
        <select class="filter-select" id="req-team-filter"><option value="all">All Teams</option>${[...new Set(TA_DATA.openReqs.map(r=>r.team))].map(t=>`<option value="${t}" ${state.reqFilter.team===t?'selected':''}>${t}</option>`).join("")}</select>
        <select class="filter-select" id="req-priority-filter"><option value="all">All Priorities</option>${['critical','high','medium','low'].map(p=>`<option value="${p}" ${state.reqFilter.priority===p?'selected':''}>${p}</option>`).join("")}</select>
      </div>
      <div style="display:flex;gap:8px;align-items:center"><span class="req-count" id="req-count">${TA_DATA.openReqs.length} reqs</span><button class="action-btn primary" onclick="App.openNewReqModal()">+ New Req</button></div>
    </div>
    <div class="reqs-table" id="reqs-table">${renderReqsTable()}</div>`;
  }

  function renderReqsTable(){
    const {search,team,priority}=state.reqFilter;
    const filtered=TA_DATA.openReqs.filter(r=>{
      if(team!=='all'&&r.team!==team)return false;
      if(priority!=='all'&&r.priority!==priority)return false;
      if(search&&!r.title.toLowerCase().includes(search.toLowerCase())&&!r.id.toLowerCase().includes(search.toLowerCase()))return false;
      return true;
    });
    $('req-count')&&($('req-count').textContent=`${filtered.length} reqs`);
    return `<div class="reqs-table-inner">
      <div class="req-header-row"><span class="req-col-id">Req ID</span><span class="req-col-title">Role</span><span class="req-col-team">Team</span><span class="req-col-level">Level</span><span class="req-col-recruiter">Recruiter</span><span class="req-col-age">Days Open</span><span class="req-col-pipe">Pipeline</span><span class="req-col-stage">Stage</span><span class="req-col-target">Target</span><span class="req-col-priority">Priority</span></div>
      ${filtered.map(r=>`<div class="req-row priority-${r.priority}" onclick="App.openReqDetail('${r.id}')">
        <span class="req-col-id req-id-text">${r.id}</span>
        <span class="req-col-title req-title-text">${r.title}</span>
        <span class="req-col-team"><span class="team-chip">${r.team}</span></span>
        <span class="req-col-level"><span class="level-chip level-${r.level.toLowerCase()}">${r.level}</span></span>
        <span class="req-col-recruiter">${r.recruiter}</span>
        <span class="req-col-age ${r.openDays>40?'age-danger':r.openDays>20?'age-warning':''}">${r.openDays}d</span>
        <span class="req-col-pipe"><span class="pipe-count">${r.pipeline}</span><div class="pipe-mini-bar"><div style="width:${Math.min(100,r.pipeline*4)}%"></div></div></span>
        <span class="req-col-stage"><span class="stage-chip stage-${r.stage.toLowerCase().replace(/\s/g,'')}">${r.stage}</span></span>
        <span class="req-col-target">${r.targetDate}</span>
        <span class="req-col-priority"><span class="priority-badge priority-${r.priority}">${r.priority}</span></span>
      </div>`).join("")}
      ${filtered.length===0?'<div class="empty-state">No matching requisitions</div>':""}
    </div>`;
  }

  function renderSourcing(){
    const sources=TA_DATA.sources;
    return `<div class="charts-grid">
      <div class="chart-card span-2"><div class="chart-card-header"><div><h3 class="chart-title">Source Effectiveness</h3><p class="chart-subtitle">Applications, hires, and cost per hire</p></div></div><div class="chart-body"><div id="chart-source-full" class="chart-area"></div></div></div>
      <div class="chart-card"><div class="chart-card-header"><div><h3 class="chart-title">Hires by Source</h3></div></div><div class="chart-body donut-body"><div id="chart-source-donut" class="chart-area"></div></div></div>
      <div class="chart-card span-3"><div class="chart-card-header"><div><h3 class="chart-title">Source Detail</h3></div></div>
        <div class="source-table">
          <div class="source-table-header"><span>Source</span><span>Applications</span><span>Hires</span><span>Conv Rate</span><span>Cost per Hire</span><span>Quality</span></div>
          ${sources.map(s=>`<div class="source-row" style="--src-color:${s.color}">
            <span class="source-name"><span class="source-dot" style="background:${s.color}"></span>${s.name}</span>
            <span>${s.applies.toLocaleString()}</span><span class="source-hires">${s.hired}</span>
            <span class="${s.convRate>1.4?'positive':s.convRate<0.8?'negative':''}">${s.convRate}%</span>
            <span class="${s.cph<5000?'positive':s.cph>20000?'negative':'warning'}">$${(s.cph/1000).toFixed(1)}K</span>
            <span><div class="quality-bar"><div style="width:${Math.min(100,s.convRate*50)}%;background:${s.color}"></div></div></span>
          </div>`).join("")}
        </div>
      </div>
    </div>`;
  }

  function renderPerformance(){
    return `<div class="charts-grid">
      <div class="chart-card span-2"><div class="chart-card-header"><div><h3 class="chart-title">Time-to-Hire by Team</h3><p class="chart-subtitle">Rolling 7-month trend (days)</p></div></div><div class="chart-body"><div id="chart-tth-full" class="chart-area"></div></div><div class="chart-legend" id="legend-tth-full"></div></div>
      <div class="chart-card"><div class="chart-card-header"><div><h3 class="chart-title">Recruiter Performance</h3></div></div><div class="chart-body">
        <div class="recruiter-list">${TA_DATA.recruiters.map(r=>`<div class="recruiter-card">
          <div class="recruiter-avatar">${r.name.split(" ").map(n=>n[0]).join("")}</div>
          <div class="recruiter-info"><span class="recruiter-name">${r.name}</span><span class="recruiter-teams">${r.teams.join(", ")}</span></div>
          <div class="recruiter-stats">
            <div class="r-stat"><span class="r-val">${r.reqs}</span><span class="r-lbl">Reqs</span></div>
            <div class="r-stat"><span class="r-val positive">${r.hiredQTD}</span><span class="r-lbl">Hired</span></div>
            <div class="r-stat"><span class="r-val">${r.avgTTH}d</span><span class="r-lbl">TTH</span></div>
            <div class="r-stat"><span class="r-val ${r.offerAccept>=85?'positive':r.offerAccept<78?'negative':''}">${r.offerAccept}%</span><span class="r-lbl">Accept</span></div>
          </div>
          <div class="recruiter-health"><div class="health-bar-track"><div class="health-bar-fill" style="width:${r.pipelineHealth}%;background:${r.pipelineHealth>=85?'#34D399':r.pipelineHealth>=70?'#FBBF24':'#F87171'}"></div></div><span class="health-pct">${r.pipelineHealth}%</span></div>
        </div>`).join("")}</div>
      </div></div>
    </div>`;
  }

  function renderTeam(){
    const iv=TA_DATA.interviews;
    return `<div class="charts-grid">
      <div class="chart-card span-2"><div class="chart-card-header"><div><h3 class="chart-title">Interview Hours per Week</h3><p class="chart-subtitle">Avg IC time · Target: 4.0 hrs/wk</p></div></div><div class="chart-body"><div id="chart-interview-hours" class="chart-area"></div></div></div>
      <div class="chart-card"><div class="chart-card-header"><div><h3 class="chart-title">Top Interviewers</h3><p class="chart-subtitle">Hours & risk</p></div></div><div class="chart-body">
        <div class="interviewer-list">${iv.panelParticipation.map(p=>`<div class="interviewer-row risk-${p.risk}">
          <div class="interviewer-info"><span class="i-name">${p.name}</span><span class="i-team">${p.team}</span></div>
          <div class="i-hours-bar"><div class="i-bar-track"><div class="i-bar-fill risk-fill-${p.risk}" style="width:${Math.min(100,(p.hoursWk/10)*100)}%"></div><div class="i-bar-target" style="left:40%"></div></div><span class="i-hours">${p.hoursWk}h</span></div>
          <span class="risk-badge risk-badge-${p.risk}">${p.risk}</span>
        </div>`).join("")}</div>
      </div></div>
    </div>`;
  }

  function renderFinance(){
    const fin=TA_DATA.finance,burnPct=Math.round((fin.spendYTD/fin.budgetYTD)*100);
    return `<div class="fin-kpi-strip">
      <div class="fin-kpi"><span class="fin-kpi-val">$${(fin.budgetYTD/1000).toFixed(0)}K</span><span class="fin-kpi-lbl">FY Budget YTD</span></div>
      <div class="fin-kpi"><span class="fin-kpi-val">$${(fin.spendYTD/1000).toFixed(0)}K</span><span class="fin-kpi-lbl">Actual Spend</span></div>
      <div class="fin-kpi ${burnPct>85?'negative':'positive'}"><span class="fin-kpi-val">${burnPct}%</span><span class="fin-kpi-lbl">Budget Burn</span></div>
      <div class="fin-kpi"><span class="fin-kpi-val">$${(fin.forecast/1000).toFixed(0)}K</span><span class="fin-kpi-lbl">Forecast</span></div>
      <div class="fin-kpi positive"><span class="fin-kpi-val">$${((fin.budgetYTD-fin.forecast)/1000).toFixed(0)}K</span><span class="fin-kpi-lbl">Projected Savings</span></div>
    </div>
    <div class="charts-grid" style="margin-top:20px">
      <div class="chart-card span-2"><div class="chart-card-header"><div><h3 class="chart-title">Monthly Spend vs Budget</h3></div></div><div class="chart-body"><div id="chart-spend" class="chart-area"></div></div><div class="chart-legend"><span class="legend-item"><span class="legend-dot" style="background:#818CF8"></span>Budget</span><span class="legend-item"><span class="legend-dot" style="background:#34D399"></span>Actual</span><span class="legend-item"><span class="legend-dash"></span>Forecast</span></div></div>
      <div class="chart-card"><div class="chart-card-header"><div><h3 class="chart-title">Budget by Category</h3></div></div><div class="chart-body"><div id="chart-budget-cats" class="chart-area"></div></div><div class="fin-legend"><span class="legend-item"><span class="legend-rect" style="background:#475569;opacity:.6"></span>Budget</span><span class="legend-item"><span class="legend-rect" style="background:#34D399"></span>Actual</span></div></div>
    </div>`;
  }

  function renderDEI(){
    const dei=TA_DATA.dei;
    return `<div class="charts-grid">
      <div class="chart-card"><div class="chart-card-header"><div><h3 class="chart-title">Pipeline Diversity</h3></div></div><div class="chart-body donut-body"><div id="chart-dei-donut" class="chart-area"></div><div class="donut-legend" id="legend-dei"></div></div></div>
      <div class="chart-card span-2"><div class="chart-card-header"><div><h3 class="chart-title">Diversity Funnel</h3><p class="chart-subtitle">Pipeline → Offers → Hired</p></div></div><div class="chart-body"><div id="chart-dei-funnel" class="chart-area"></div></div></div>
      <div class="chart-card span-2"><div class="chart-card-header"><div><h3 class="chart-title">Women in Pipeline — Quarterly Trend</h3></div></div><div class="chart-body"><div id="chart-dei-trend" class="chart-area"></div></div></div>
      <div class="chart-card"><div class="chart-card-header"><div><h3 class="chart-title">Representation Gap</h3><p class="chart-subtitle">vs company targets</p></div></div><div class="chart-body">
        <div class="dei-gap-list">${[
          {label:"Women",actual:dei.hired.women,target:45,color:"#818CF8"},
          {label:"URM",actual:dei.hired.urm,target:30,color:"#34D399"},
          {label:"Veterans",actual:dei.hired.veteran,target:7,color:"#60A5FA"},
        ].map(item=>`<div class="dei-gap-item">
          <div class="dei-gap-header"><span class="dei-gap-label">${item.label}</span><span class="dei-gap-vals"><span style="color:${item.color}">${item.actual}%</span><span class="dei-gap-sep">vs</span><span class="dei-target">${item.target}% target</span></span></div>
          <div class="dei-gap-bar-track"><div class="dei-gap-bar-actual" style="width:${item.actual}%;background:${item.color}"></div><div class="dei-gap-bar-target" style="left:${item.target}%"></div></div>
          <div class="dei-gap-status ${item.actual>=item.target?'positive':'negative'}">${item.actual>=item.target?'✓ '+(item.actual-item.target)+'pp above target':(item.target-item.actual)+'pp below target'}</div>
        </div>`).join("")}</div>
      </div></div>
    </div>`;
  }

  function renderCharts(){
    qsa('.kpi-sparkline').forEach(el=>{
      Charts.sparkline(el,JSON.parse(el.dataset.sparkline),el.dataset.color);
    });
    qsa('.kpi-value[data-animate]').forEach(el=>{
      const key=el.closest('.kpi-card')?.dataset.kpi;
      if(!state.animatedOnce.has(key)){
        animateCount(el,parseFloat(el.dataset.animate),900,el.dataset.prefix||'',el.dataset.suffix||'');
        state.animatedOnce.add(key);
      }
    });
    const s=state.section;
    if(s==='overview'){
      const fe=$('chart-funnel'); if(fe) Charts.funnel(fe,TA_DATA.pipeline.stages);
      const te=$('chart-tth');
      if(te){
        const tth=TA_DATA.tthTrends,tc={Engineering:'#818CF8',Product:'#34D399',Sales:'#60A5FA',Marketing:'#FB923C'};
        const series=Object.entries(tth.teams).map(([n,d])=>({label:n.slice(0,3),data:d,color:tc[n]}));
        Charts.lineChart(te,{labels:tth.months,series,height:200});
        const leg=$('legend-tth'); if(leg) leg.innerHTML=series.map(s=>`<span class="legend-item"><span class="legend-dot" style="background:${s.color}"></span>${s.label}</span>`).join('');
      }
      const de=$('chart-donut');
      if(de){
        Charts.donut(de,{segments:[{value:82,color:'#34D399'},{value:18,color:'#1E2028'}],size:140,thickness:24,label:'82%',sublabel:'acceptance'});
        const leg=$('legend-donut'); if(leg) leg.innerHTML='<div class="legend-item"><span class="legend-dot" style="background:#34D399"></span>Accepted (82%)</div><div class="legend-item"><span class="legend-dot" style="background:#475569"></span>Declined (18%)</div><div class="legend-note">↑ +4pp vs last quarter</div>';
      }
      const he=$('chart-headcount');
      if(he){ const t=TA_DATA.headcount.teams; Charts.barChart(he,{labels:t.map(t=>t.team.slice(0,3)),series:[{label:'Plan',data:t.map(t=>t.plan),color:'#475569'},{label:'Hired',data:t.map(t=>t.hired),color:'#34D399'},{label:'Pipeline',data:t.map(t=>t.pipeline),color:'#818CF8'}],height:220}); }
      const se=$('chart-source'); if(se) Charts.hBar(se,{items:TA_DATA.sources.map(s=>({label:s.name,value:s.hired,color:s.color})),maxVal:15});
    }
    if(s==='pipeline'){
      const ff=$('chart-funnel-full'); if(ff) Charts.funnel(ff,TA_DATA.pipeline.stages);
      const pt=$('chart-pipeline-team');
      if(pt){ const bt=TA_DATA.pipeline.byTeam,tn=Object.keys(bt); Charts.barChart(pt,{labels:tn.map(t=>t.slice(0,3)),series:[{label:'Applied',data:tn.map(t=>bt[t].applied),color:'#818CF8'},{label:'Interview',data:tn.map(t=>bt[t].interview),color:'#34D399'},{label:'Offer',data:tn.map(t=>bt[t].offer),color:'#FB923C'}],height:220}); }
      const ce=$('chart-conversion'); if(ce) Charts.hBar(ce,{items:TA_DATA.pipeline.stages.slice(1).map(s=>({label:s.name,value:s.conversion,color:'#818CF8'})),showPct:true,maxVal:100});
    }
    if(s==='headcount'){
      const qe=$('chart-quarterly'); if(qe){ const qd=TA_DATA.headcount.quarterlyHires; Charts.barChart(qe,{labels:qd.labels,series:[{label:'Planned',data:qd.planned,color:'#818CF8'},{label:'Actual',data:qd.actual,color:'#34D399'}],height:200}); }
      const hd=$('chart-hc-donut'); if(hd){ const t=TA_DATA.headcount.teams,c=['#818CF8','#34D399','#60A5FA','#FB923C','#F472B6','#FBBF24']; Charts.donut(hd,{segments:t.map((t,i)=>({value:t.hired,color:c[i]})),size:160,thickness:30,label:'38',sublabel:'hired'}); }
    }
    if(s==='sourcing'){
      const sf=$('chart-source-full'); if(sf) Charts.barChart(sf,{labels:TA_DATA.sources.map(s=>s.name),series:[{label:'Apps',data:TA_DATA.sources.map(s=>s.applies),color:'#818CF8'},{label:'Hires',data:TA_DATA.sources.map(s=>s.hired*40),color:'#34D399'}],height:220});
      const sd=$('chart-source-donut'); if(sd) Charts.donut(sd,{segments:TA_DATA.sources.map(s=>({value:s.hired,color:s.color})),size:140,thickness:26,label:'38',sublabel:'total hires'});
    }
    if(s==='performance'){
      const tf=$('chart-tth-full');
      if(tf){ const tth=TA_DATA.tthTrends,tc={Engineering:'#818CF8',Product:'#34D399',Sales:'#60A5FA',Marketing:'#FB923C'}; const series=Object.entries(tth.teams).map(([n,d])=>({label:n,data:d,color:tc[n]})); Charts.lineChart(tf,{labels:tth.months,series,height:220}); const leg=$('legend-tth-full'); if(leg) leg.innerHTML=series.map(s=>`<span class="legend-item"><span class="legend-dot" style="background:${s.color}"></span>${s.label}</span>`).join(''); }
    }
    if(s==='team'){
      const ih=$('chart-interview-hours'); if(ih){ const d=TA_DATA.interviews.weeklyHours; Charts.hBar(ih,{items:d.teams.map((t,i)=>({label:t,value:d.hours[i],color:d.hours[i]>d.target?'#F87171':d.hours[i]>d.target*0.8?'#FBBF24':'#34D399'})),maxVal:10}); }
    }
    if(s==='finance'){
      const sp=$('chart-spend'); if(sp){ const f=TA_DATA.finance.monthlySpend; Charts.lineChart(sp,{labels:f.months,series:[{label:'Budget',data:f.budget,color:'#818CF8'},{label:'Actual',data:f.actual,color:'#34D399'},{label:'Forecast',data:f.forecast,color:'#FBBF24',dashed:true}],height:220}); }
      const bc=$('chart-budget-cats'); if(bc) Charts.budgetBars(bc,{items:TA_DATA.finance.byCategory});
    }
    if(s==='dei'){
      const dd=$('chart-dei-donut');
      if(dd){ const d=TA_DATA.dei.pipeline; Charts.donut(dd,{segments:[{value:d.women,color:'#818CF8'},{value:d.urm,color:'#34D399'},{value:d.veteran,color:'#60A5FA'},{value:d.other,color:'#1E2028'}],size:140,thickness:26,label:`${d.women+d.urm+d.veteran}%`,sublabel:'diverse'}); const leg=$('legend-dei'); if(leg) leg.innerHTML=[{l:'Women',v:d.women,c:'#818CF8'},{l:'URM',v:d.urm,c:'#34D399'},{l:'Vets',v:d.veteran,c:'#60A5FA'}].map(x=>`<div class="legend-item"><span class="legend-dot" style="background:${x.c}"></span>${x.l} ${x.v}%</div>`).join(''); }
      const df=$('chart-dei-funnel'); if(df){ const d=TA_DATA.dei; Charts.barChart(df,{labels:['Pipeline','Offers','Hired'],series:[{label:'Women',data:[d.pipeline.women,d.offers.women,d.hired.women],color:'#818CF8'},{label:'URM',data:[d.pipeline.urm,d.offers.urm,d.hired.urm],color:'#34D399'},{label:'Vets',data:[d.pipeline.veteran,d.offers.veteran,d.hired.veteran],color:'#60A5FA'}],height:200}); }
      const dt=$('chart-dei-trend'); if(dt){ const d=TA_DATA.dei.trend; Charts.lineChart(dt,{labels:d.months,series:[{label:'Women',data:d.women,color:'#818CF8'},{label:'URM',data:d.urm,color:'#34D399'}],height:200}); }
    }
  }

  function getPersonaAlerts(){ return TA_DATA.alerts.filter(a=>a.persona.includes(state.persona)); }

  function openDrawer(title,content){
    $('drawer-title').textContent=title;
    $('drawer-body').innerHTML=content;
    $('drawer').classList.add('open');
    $('drawer-backdrop').classList.add('open');
    state.drawerOpen=true;
  }

  function closeDrawer(){
    $('drawer').classList.remove('open');
    $('drawer-backdrop').classList.remove('open');
    state.drawerOpen=false;
  }

  function openReqDetail(reqId){
    const req=TA_DATA.openReqs.find(r=>r.id===reqId); if(!req)return;
    openDrawer(`${req.id} — ${req.title}`,`
      <div class="drawer-req-detail">
        <div class="req-detail-meta"><span class="priority-badge priority-${req.priority} large">${req.priority}</span><span class="stage-chip stage-${req.stage.toLowerCase().replace(/\s/g,'')}">${req.stage}</span></div>
        <div class="detail-grid">
          <div class="detail-item"><span class="d-label">Team</span><span class="d-val">${req.team}</span></div>
          <div class="detail-item"><span class="d-label">Level</span><span class="d-val">${req.level}</span></div>
          <div class="detail-item"><span class="d-label">Recruiter</span><span class="d-val">${req.recruiter}</span></div>
          <div class="detail-item"><span class="d-label">Days Open</span><span class="d-val ${req.openDays>40?'negative':''}">${req.openDays} days</span></div>
          <div class="detail-item"><span class="d-label">Pipeline</span><span class="d-val">${req.pipeline} candidates</span></div>
          <div class="detail-item"><span class="d-label">Target Close</span><span class="d-val">${req.targetDate}</span></div>
        </div>
        <div class="detail-actions"><button class="action-btn primary">View in ATS</button><button class="action-btn">Notify Recruiter</button><button class="action-btn danger">Put on Hold</button></div>
        <div class="detail-pipeline-mini"><h4>Pipeline Stages</h4>${['Applied','Screen','Interview','Onsite','Offer','Hired'].map(st=>`<div class="mini-stage ${st===req.stage?'active-stage':''}"><span class="mini-stage-dot"></span><span>${st}</span>${st===req.stage?'<span class="current-badge">← current</span>':''}</div>`).join('')}</div>
      </div>`);
  }

  function openTeamDrill(team){
    const td=TA_DATA.headcount.teams.find(t=>t.team===team); if(!td)return;
    const reqs=TA_DATA.openReqs.filter(r=>r.team===team);
    openDrawer(`${team} — Headcount Detail`,`
      <div class="drawer-team-detail">
        <div class="team-hc-summary">
          <div class="thcs-item"><span class="thcs-val">${td.plan}</span><span class="thcs-lbl">Plan</span></div>
          <div class="thcs-item positive"><span class="thcs-val">${td.hired}</span><span class="thcs-lbl">Hired</span></div>
          <div class="thcs-item warning"><span class="thcs-val">${td.pipeline}</span><span class="thcs-lbl">In Pipeline</span></div>
          <div class="thcs-item ${td.gap>0?'negative':'positive'}"><span class="thcs-val">${td.gap}</span><span class="thcs-lbl">Gap</span></div>
        </div>
        <div class="team-progress-full"><div class="hc-progress-bar large"><div class="hc-progress-hired" style="width:${(td.hired/td.plan)*100}%"></div><div class="hc-progress-pipe" style="width:${(td.pipeline/td.plan)*100}%;left:${(td.hired/td.plan)*100}%"></div></div><span>${Math.round(((td.hired+td.pipeline)/td.plan)*100)}% toward plan</span></div>
        <h4 style="margin:16px 0 8px">Open Reqs (${reqs.length})</h4>
        ${reqs.map(r=>`<div class="mini-req-row" onclick="App.openReqDetail('${r.id}')"><span class="req-id-text">${r.id}</span><span>${r.title}</span><span class="priority-badge priority-${r.priority}">${r.priority}</span></div>`).join('')}
      </div>`);
  }

  function openAlerts(){
    const alerts=getPersonaAlerts();
    openDrawer('Alerts & Actions',`<div class="alerts-drawer">${alerts.map(a=>`<div class="alert-drawer-item alert-${a.type}"><div class="alert-drawer-header"><span class="alert-type-badge">${a.type.toUpperCase()}</span><span class="alert-drawer-title">${a.title}</span></div><p class="alert-drawer-detail">${a.detail}</p><div class="alert-drawer-actions"><button class="action-btn primary small">Take Action</button><button class="action-btn small">Dismiss</button></div></div>`).join('')}</div>`);
  }

  function openNewReqModal(){
    openDrawer('Create New Requisition',`<div class="new-req-form">
      <div class="form-group"><label>Role Title</label><input type="text" class="form-input" placeholder="e.g. Senior Software Engineer"></div>
      <div class="form-row">
        <div class="form-group"><label>Team</label><select class="form-input"><option>Engineering</option><option>Product</option><option>Sales</option><option>Marketing</option><option>Design</option><option>G&A</option></select></div>
        <div class="form-group"><label>Level</label><select class="form-input"><option>Entry</option><option>Mid</option><option>Senior</option><option>Staff</option><option>Principal</option><option>Director</option></select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Recruiter</label><select class="form-input">${TA_DATA.recruiters.map(r=>`<option>${r.name}</option>`).join('')}</select></div>
        <div class="form-group"><label>Priority</label><select class="form-input"><option>critical</option><option>high</option><option>medium</option><option>low</option></select></div>
      </div>
      <div class="form-group"><label>Target Start Date</label><input type="date" class="form-input"></div>
      <div class="form-actions"><button class="action-btn primary">Create Req</button><button class="action-btn" onclick="App.closeDrawer()">Cancel</button></div>
    </div>`);
  }

  function openPalette(){
    state.paletteOpen=true;
    $('palette-overlay').classList.add('open');
    setTimeout(()=>$('palette-input').focus(),50);
    renderPaletteResults('');
  }

  function closePalette(){
    state.paletteOpen=false;
    $('palette-overlay').classList.remove('open');
    $('palette-input').value='';
  }

  function renderPaletteResults(query){
    const q=query.toLowerCase(),results=[];
    NAV_ITEMS.forEach(n=>{ if(!q||n.label.toLowerCase().includes(q)) results.push({type:'nav',icon:n.icon,label:`Go to ${n.label}`,action:()=>{closePalette();navigateTo(n.id);}}); });
    TA_DATA.personas.forEach(p=>{ if(!q||p.label.toLowerCase().includes(q)) results.push({type:'persona',icon:'◉',label:`Switch to ${p.label}`,sub:p.abbr,action:()=>{closePalette();switchPersona(p.id);}}); });
    TA_DATA.openReqs.forEach(r=>{ if(!q||r.title.toLowerCase().includes(q)||r.id.toLowerCase().includes(q)) results.push({type:'req',icon:'☰',label:r.title,sub:`${r.id} · ${r.team} · ${r.priority}`,action:()=>{closePalette();openReqDetail(r.id);}}); });
    const el=$('palette-results');
    if(!results.length){el.innerHTML=`<div class="palette-empty">No results for "${query}"</div>`;return;}
    let lastType=null;
    const slice=results.slice(0,12);
    el.innerHTML=slice.map(r=>{
      const tl=lastType!==r.type?`<div class="palette-group-label">${r.type==='nav'?'Navigation':r.type==='persona'?'Personas':'Requisitions'}</div>`:'';
      lastType=r.type;
      return `${tl}<div class="palette-result-item"><span class="palette-result-icon">${r.icon}</span><div class="palette-result-text"><span class="palette-result-label">${r.label}</span>${r.sub?`<span class="palette-result-sub">${r.sub}</span>`:''}</div><span class="palette-result-enter">↵</span></div>`;
    }).join('');
    el.querySelectorAll('.palette-result-item').forEach((item,i)=>item.addEventListener('click',()=>slice[i]?.action?.()));
  }

  function switchPersona(personaId){
    state.persona=personaId;
    state.animatedOnce.clear();
    const cfg=PERSONA_CONFIG[personaId];
    qsa('.persona-pill').forEach(btn=>{
      const active=btn.dataset.persona===personaId;
      btn.classList.toggle('active',active);
      if(active) btn.style.setProperty('--pill-color',cfg.accentColor);
      else btn.style.removeProperty('--pill-color');
    });
    document.documentElement.style.setProperty('--accent',cfg.accentColor);
    renderSection();
  }

  function bindGlobalEvents(){
    $('persona-switcher').addEventListener('click',e=>{ const b=e.target.closest('[data-persona]'); if(b) switchPersona(b.dataset.persona); });
    $('sidebar-nav').addEventListener('click',e=>{ e.preventDefault(); const i=e.target.closest('[data-section]'); if(i) navigateTo(i.dataset.section); });
    $('drawer-close').addEventListener('click',closeDrawer);
    $('drawer-backdrop').addEventListener('click',closeDrawer);
    $('alert-btn').addEventListener('click',openAlerts);
    ['search-trigger','open-palette'].forEach(id=>$(id)?.addEventListener('click',openPalette));
    $('palette-overlay').addEventListener('click',e=>{ if(e.target===$('palette-overlay')) closePalette(); });
    $('palette-input').addEventListener('input',e=>renderPaletteResults(e.target.value));
    document.addEventListener('keydown',e=>{
      if((e.metaKey||e.ctrlKey)&&e.key==='k'){ e.preventDefault(); state.paletteOpen?closePalette():openPalette(); }
      if(e.key==='Escape'){ if(state.paletteOpen) closePalette(); else if(state.drawerOpen) closeDrawer(); }
    });
  }

  function bindSectionEvents(){
    const rs=$('req-search'),rt=$('req-team-filter'),rp=$('req-priority-filter');
    if(rs) rs.addEventListener('input',e=>{ state.reqFilter.search=e.target.value; $('reqs-table').innerHTML=renderReqsTable(); bindSectionEvents(); });
    if(rt) rt.addEventListener('change',e=>{ state.reqFilter.team=e.target.value; $('reqs-table').innerHTML=renderReqsTable(); bindSectionEvents(); });
    if(rp) rp.addEventListener('change',e=>{ state.reqFilter.priority=e.target.value; $('reqs-table').innerHTML=renderReqsTable(); bindSectionEvents(); });
    qsa('.alert-dismiss').forEach(btn=>btn.addEventListener('click',e=>{ e.stopPropagation(); btn.closest('.alert-item')?.remove(); }));
    qsa('[data-funnel-view]').forEach(btn=>btn.addEventListener('click',()=>{ qsa('[data-funnel-view]').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); }));
  }

  function init(){
    const cfg=PERSONA_CONFIG[state.persona];
    document.documentElement.style.setProperty('--accent',cfg.accentColor);
    renderShell();
    navigateTo(cfg.defaultSection||'overview');
  }

  return {init,openReqDetail,openTeamDrill,openAlerts,openNewReqModal,closeDrawer,switchPersona};
})();

document.addEventListener('DOMContentLoaded',()=>App.init());
