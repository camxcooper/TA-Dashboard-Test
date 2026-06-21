const TA_DATA = {
  meta: {
    company: "Meridian Systems",
    fiscalQuarter: "Q2 2026",
    lastUpdated: "Jun 21, 2026 · 9:14 AM",
    planPeriod: "FY2026",
  },

  personas: [
    { id: "vpta",   label: "VP Talent Acquisition",   abbr: "VP TA",   color: "#818CF8" },
    { id: "cpo",    label: "Chief People Officer",     abbr: "CPO",     color: "#34D399" },
    { id: "evpeng", label: "EVP Engineering",          abbr: "EVP Eng", color: "#FB923C" },
    { id: "direng", label: "Director of Engineering",  abbr: "Dir Eng", color: "#F472B6" },
    { id: "cto",    label: "Chief Technology Officer", abbr: "CTO",     color: "#60A5FA" },
    { id: "dirfpa", label: "Director of FP&A",         abbr: "Dir FP&A",color: "#FBBF24" },
  ],

  kpis: {
    openReqs:         { value: 47,     delta: +5,    unit: "",       label: "Open Reqs",         trend: "up",   sparkline: [38,40,42,39,44,46,47] },
    activeInPipeline: { value: 2847,   delta: +312,  unit: "",       label: "Active Pipeline",   trend: "up",   sparkline: [2100,2250,2400,2520,2680,2790,2847] },
    avgTTH:           { value: 34,     delta: -3,    unit: "days",   label: "Avg Time-to-Hire", trend: "down", sparkline: [42,40,39,38,37,35,34] },
    offerAcceptance:  { value: 82,     delta: +4,    unit: "%",      label: "Offer Acceptance", trend: "up",   sparkline: [72,74,76,78,79,80,82] },
    hiredYTD:         { value: 38,     delta: +6,    unit: "",       label: "Hired YTD",        trend: "up",   sparkline: [6,12,18,22,27,32,38] },
    headcountGap:     { value: 10,     delta: -3,    unit: "",       label: "HC Gap",           trend: "down", sparkline: [18,16,15,14,13,11,10] },
    costPerHire:      { value: 12400,  delta: -800,  unit: "$",      label: "Cost per Hire",    trend: "down", sparkline: [14200,13800,13400,13100,12900,12600,12400] },
    recruiterLoad:    { value: 9.4,    delta: +1.1,  unit: "reqs",   label: "Recruiter Load",   trend: "up",   sparkline: [7.2,7.8,8.1,8.5,9.0,9.2,9.4] },
    diversionRate:    { value: 38,     delta: +5,    unit: "%",      label: "Diverse Pipeline", trend: "up",   sparkline: [28,30,31,33,35,37,38] },
    interviewHours:   { value: 6.2,    delta: +0.8,  unit: "hrs/wk", label: "IC Interview Hrs", trend: "up",   sparkline: [4.1,4.5,4.8,5.2,5.6,5.9,6.2] },
    agencySpend:      { value: 284000, delta: -22000,unit: "$",      label: "Agency Spend YTD", trend: "down", sparkline: [340000,330000,320000,315000,305000,290000,284000] },
    hcBudgetBurn:     { value: 68,     delta: +8,    unit: "%",      label: "HC Budget Burn",   trend: "up",   sparkline: [42,48,52,56,61,65,68] },
  },

  pipeline: {
    stages: [
      { name: "Applied",        count: 2847, conversion: null, avgDays: 0  },
      { name: "Screen",         count: 892,  conversion: 31.3, avgDays: 4  },
      { name: "Phone Interview",count: 421,  conversion: 47.2, avgDays: 8  },
      { name: "Take-Home",      count: 218,  conversion: 51.8, avgDays: 6  },
      { name: "Onsite",         count: 142,  conversion: 65.1, avgDays: 10 },
      { name: "Offer",          count: 68,   conversion: 47.9, avgDays: 5  },
      { name: "Hired",          count: 38,   conversion: 55.9, avgDays: 3  },
    ],
    byTeam: {
      "Engineering": { applied:1240, screen:380, interview:188, onsite:68, offer:28, hired:14 },
      "Product":     { applied:420,  screen:128, interview:60,  onsite:22, offer:10, hired:6  },
      "Sales":       { applied:680,  screen:220, interview:98,  onsite:30, offer:18, hired:10 },
      "Marketing":   { applied:210,  screen:72,  interview:32,  onsite:10, offer:6,  hired:4  },
      "G&A":         { applied:180,  screen:60,  interview:28,  onsite:8,  offer:4,  hired:2  },
      "Design":      { applied:117,  screen:32,  interview:15,  onsite:4,  offer:2,  hired:2  },
    }
  },

  sources: [
    { name:"LinkedIn",   applies:1120, hired:14, cph:8200,  convRate:1.25, color:"#818CF8" },
    { name:"Referral",   applies:682,  hired:12, cph:3100,  convRate:1.76, color:"#34D399" },
    { name:"Greenhouse", applies:498,  hired:7,  cph:5400,  convRate:1.41, color:"#60A5FA" },
    { name:"Agency",     applies:284,  hired:3,  cph:28600, convRate:1.06, color:"#FB923C" },
    { name:"Indeed",     applies:198,  hired:1,  cph:9100,  convRate:0.51, color:"#F472B6" },
    { name:"Direct",     applies:65,   hired:1,  cph:2800,  convRate:1.54, color:"#FBBF24" },
  ],

  headcount: {
    teams: [
      { team:"Engineering", plan:24, hired:14, pipeline:6, gap:4, avgComp:185000 },
      { team:"Product",     plan:8,  hired:6,  pipeline:1, gap:1, avgComp:175000 },
      { team:"Sales",       plan:16, hired:10, pipeline:4, gap:2, avgComp:135000 },
      { team:"Marketing",   plan:6,  hired:4,  pipeline:1, gap:1, avgComp:140000 },
      { team:"G&A",         plan:4,  hired:2,  pipeline:1, gap:1, avgComp:120000 },
      { team:"Design",      plan:4,  hired:2,  pipeline:1, gap:1, avgComp:155000 },
    ],
    quarterlyHires: {
      labels:  ["Q3 '25","Q4 '25","Q1 '26","Q2 '26 Plan","Q2 '26 Act"],
      planned: [18,22,20,24,null],
      actual:  [16,21,19,null,14],
    }
  },

  tthTrends: {
    months: ["Dec","Jan","Feb","Mar","Apr","May","Jun"],
    teams: {
      "Engineering": [48,46,42,40,38,36,34],
      "Product":     [40,38,36,35,34,33,32],
      "Sales":       [28,27,26,27,25,25,24],
      "Marketing":   [35,34,33,32,31,30,29],
    }
  },

  openReqs: [
    { id:"ENG-101", title:"Staff Software Engineer - Platform",  team:"Engineering", level:"Staff",     recruiter:"Sarah K.",  openDays:42, pipeline:12, stage:"Onsite",    priority:"high",     targetDate:"Jul 15" },
    { id:"ENG-102", title:"Senior SWE - Data Infrastructure",    team:"Engineering", level:"Senior",    recruiter:"Marcus T.", openDays:28, pipeline:8,  stage:"Interview",  priority:"high",     targetDate:"Jul 22" },
    { id:"ENG-103", title:"SWE II - Mobile (iOS)",               team:"Engineering", level:"Mid",       recruiter:"Sarah K.",  openDays:19, pipeline:5,  stage:"Screen",     priority:"medium",   targetDate:"Aug 1"  },
    { id:"ENG-104", title:"Principal Engineer - AI/ML",          team:"Engineering", level:"Principal", recruiter:"Priya N.",  openDays:56, pipeline:4,  stage:"Onsite",    priority:"critical", targetDate:"Jul 8"  },
    { id:"ENG-105", title:"Senior SWE - Backend (Payments)",     team:"Engineering", level:"Senior",    recruiter:"Marcus T.", openDays:14, pipeline:9,  stage:"Screen",     priority:"high",     targetDate:"Aug 5"  },
    { id:"ENG-106", title:"SWE II - Frontend (React)",           team:"Engineering", level:"Mid",       recruiter:"Sarah K.",  openDays:7,  pipeline:14, stage:"Applied",    priority:"medium",   targetDate:"Aug 15" },
    { id:"PRD-201", title:"Senior PM - Growth",                  team:"Product",     level:"Senior",    recruiter:"Priya N.",  openDays:31, pipeline:6,  stage:"Onsite",    priority:"high",     targetDate:"Jul 18" },
    { id:"PRD-202", title:"Staff PM - Platform",                 team:"Product",     level:"Staff",     recruiter:"Priya N.",  openDays:21, pipeline:3,  stage:"Interview",  priority:"medium",   targetDate:"Aug 10" },
    { id:"SLS-301", title:"Enterprise AE - East",                team:"Sales",       level:"Senior",    recruiter:"Jamie R.",  openDays:9,  pipeline:18, stage:"Screen",     priority:"high",     targetDate:"Jul 30" },
    { id:"SLS-302", title:"Enterprise AE - West",                team:"Sales",       level:"Senior",    recruiter:"Jamie R.",  openDays:9,  pipeline:16, stage:"Screen",     priority:"high",     targetDate:"Jul 30" },
    { id:"SLS-303", title:"Sales Development Rep (3 openings)",  team:"Sales",       level:"Entry",     recruiter:"Jamie R.",  openDays:5,  pipeline:42, stage:"Applied",    priority:"medium",   targetDate:"Aug 20" },
    { id:"SLS-304", title:"Director of Sales Enablement",        team:"Sales",       level:"Director",  recruiter:"Priya N.",  openDays:45, pipeline:5,  stage:"Onsite",    priority:"critical", targetDate:"Jul 10" },
    { id:"MKT-401", title:"Senior Growth Marketer",              team:"Marketing",   level:"Senior",    recruiter:"Marcus T.", openDays:18, pipeline:7,  stage:"Interview",  priority:"medium",   targetDate:"Aug 5"  },
    { id:"MKT-402", title:"Content Marketing Manager",           team:"Marketing",   level:"Mid",       recruiter:"Marcus T.", openDays:12, pipeline:9,  stage:"Screen",     priority:"low",      targetDate:"Aug 20" },
    { id:"DES-501", title:"Senior Product Designer",             team:"Design",      level:"Senior",    recruiter:"Sarah K.",  openDays:24, pipeline:6,  stage:"Onsite",    priority:"high",     targetDate:"Jul 25" },
    { id:"DES-502", title:"Design Systems Engineer",             team:"Design",      level:"Senior",    recruiter:"Sarah K.",  openDays:38, pipeline:3,  stage:"Interview",  priority:"medium",   targetDate:"Jul 31" },
    { id:"GNA-601", title:"Sr. Financial Analyst",               team:"G&A",         level:"Senior",    recruiter:"Jamie R.",  openDays:16, pipeline:4,  stage:"Offer",      priority:"high",     targetDate:"Jul 5"  },
    { id:"GNA-602", title:"Head of Legal",                       team:"G&A",         level:"Director",  recruiter:"Priya N.",  openDays:62, pipeline:2,  stage:"Offer",      priority:"critical", targetDate:"Jul 1"  },
  ],

  recruiters: [
    { name:"Sarah K.",  reqs:10, hiredQTD:5, avgTTH:32, offerAccept:88, pipelineHealth:84, teams:["Engineering","Design"]   },
    { name:"Marcus T.", reqs:9,  hiredQTD:4, avgTTH:36, offerAccept:80, pipelineHealth:76, teams:["Engineering","Marketing"] },
    { name:"Priya N.",  reqs:11, hiredQTD:6, avgTTH:31, offerAccept:83, pipelineHealth:90, teams:["Product","G&A","Sales"]   },
    { name:"Jamie R.",  reqs:10, hiredQTD:8, avgTTH:28, offerAccept:79, pipelineHealth:82, teams:["Sales","G&A"]             },
    { name:"Dev M.",    reqs:7,  hiredQTD:2, avgTTH:41, offerAccept:77, pipelineHealth:68, teams:["Engineering"]             },
  ],

  dei: {
    pipeline: { women:38, urm:22, veteran:4, other:36 },
    offers:   { women:41, urm:24, veteran:3, other:32 },
    hired:    { women:43, urm:26, veteran:5, other:26 },
    trend: {
      months: ["Q3'25","Q4'25","Q1'26","Q2'26"],
      women:  [34,36,37,38],
      urm:    [18,20,21,22],
    }
  },

  finance: {
    budgetYTD: 520000,
    spendYTD:  354000,
    forecast:  498000,
    byCategory: [
      { cat:"Recruiter Salaries", budget:280000, actual:196000 },
      { cat:"Agency Fees",        budget:120000, actual:88400  },
      { cat:"Job Boards/Tools",   budget:72000,  actual:47600  },
      { cat:"Referral Bonuses",   budget:30000,  actual:14400  },
      { cat:"Events/Sourcing",    budget:18000,  actual:7600   },
    ],
    monthlySpend: {
      months:   ["Jan","Feb","Mar","Apr","May","Jun"],
      budget:   [85000,85000,85000,90000,90000,85000],
      actual:   [72000,78000,82000,64000,58000,null],
      forecast: [null,null,null,null,null,86000],
    }
  },

  interviews: {
    weeklyHours: {
      teams:  ["Eng","Product","Sales","Marketing","Design","G&A"],
      hours:  [6.2,4.8,3.2,2.4,3.6,1.8],
      target: 4.0,
    },
    panelParticipation: [
      { name:"Alex Chen",    team:"Eng",     hoursWk:8.4, panels:6, risk:"high"   },
      { name:"Maria Santos", team:"Eng",     hoursWk:6.1, panels:4, risk:"medium" },
      { name:"James Park",   team:"Product", hoursWk:5.8, panels:4, risk:"medium" },
      { name:"Raj Patel",    team:"Eng",     hoursWk:5.2, panels:3, risk:"medium" },
      { name:"Sofia Kim",    team:"Design",  hoursWk:4.4, panels:3, risk:"low"    },
      { name:"Tom Baker",    team:"Sales",   hoursWk:3.8, panels:3, risk:"low"    },
    ]
  },

  alerts: [
    { id:1, type:"critical", title:"GNA-602 (Head of Legal) - Offer deadline Jul 1",  detail:"Candidate has competing offer. Decision needed in 48hrs.",     persona:["vpta","cpo","cto"] },
    { id:2, type:"warning",  title:"ENG-104 (Principal AI/ML) - 56 days open",        detail:"Longest-open req. Pipeline stalled at Onsite stage.",          persona:["vpta","evpeng","cto","direng"] },
    { id:3, type:"warning",  title:"Dev M. recruiter load at risk",                   detail:"7 reqs, but pipeline health 68% - lowest on team.",            persona:["vpta"] },
    { id:4, type:"info",     title:"Agency spend $22K under budget YTD",              detail:"On track to close $40K under. Consider reallocation.",         persona:["dirfpa","vpta"] },
    { id:5, type:"info",     title:"Alex Chen interview hours 8.4/wk (target: 4.0)", detail:"At risk of interview fatigue. Consider redistributing panels.", persona:["direng","evpeng","cto"] },
    { id:6, type:"success",  title:"Diverse pipeline at 38% - Q2 target hit",         detail:"YoY +10pp. Strong referral program driving results.",          persona:["cpo","vpta"] },
  ],
};
