// Momentum — data, helpers, constants
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DOW_SHORT = ["S","M","T","W","T","F","S"];

const CATS = {
  class:    { label:"Classes",  fill:"var(--cat-class)",    bar:"var(--cat-class-bar)",    ink:"var(--cat-class-ink)" },
  study:    { label:"Study",    fill:"var(--cat-study)",    bar:"var(--cat-study-bar)",    ink:"var(--cat-study-ink)" },
  health:   { label:"Health",   fill:"var(--cat-health)",   bar:"var(--cat-health-bar)",   ink:"var(--cat-health-ink)" },
  social:   { label:"Social",   fill:"var(--cat-social)",   bar:"var(--cat-social-bar)",   ink:"var(--cat-social-ink)" },
  rest:     { label:"Rest",     fill:"var(--cat-rest)",     bar:"var(--cat-rest-bar)",     ink:"var(--cat-rest-ink)" },
  personal: { label:"Personal", fill:"var(--cat-personal)", bar:"var(--cat-personal-bar)", ink:"var(--cat-personal-ink)" },
};

// Reference "today" = May 6, 2026 (Wed). View month: May 2026.
const TODAY = { y: 2026, m: 4, d: 6 }; // m is 0-indexed

// Build the seed events keyed by ISO-ish "YYYY-M-D"
function k(y,m,d){ return `${y}-${m}-${d}`; }

// helper to spawn weekly recurring events across May 2026
function weekly(dayOfWeek, base){
  const out = [];
  for (let d=1; d<=31; d++){
    const dt = new Date(2026, 4, d);
    if (dt.getDay() === dayOfWeek){
      out.push({ ...base, key:k(2026,4,d) });
    }
  }
  return out;
}

const SEED_EVENTS = [
  // Classes (recurring)
  ...weekly(1, { id:"cls-cs-mon",  cat:"class", title:"CS 374 Algorithms", start:"10:00", end:"10:50", loc:"Siebel 1404" }),
  ...weekly(3, { id:"cls-cs-wed",  cat:"class", title:"CS 374 Algorithms", start:"10:00", end:"10:50", loc:"Siebel 1404" }),
  ...weekly(5, { id:"cls-cs-fri",  cat:"class", title:"CS 374 Algorithms", start:"10:00", end:"10:50", loc:"Siebel 1404" }),
  ...weekly(2, { id:"cls-stat-tue", cat:"class", title:"STAT 410 Stats",   start:"13:00", end:"14:15", loc:"Altgeld 245" }),
  ...weekly(4, { id:"cls-stat-thu", cat:"class", title:"STAT 410 Stats",   start:"13:00", end:"14:15", loc:"Altgeld 245" }),
  ...weekly(1, { id:"cls-phil-mon", cat:"class", title:"PHIL 270 Ethics",  start:"15:00", end:"16:15", loc:"Lincoln Hall" }),
  ...weekly(3, { id:"cls-phil-wed", cat:"class", title:"PHIL 270 Ethics",  start:"15:00", end:"16:15", loc:"Lincoln Hall" }),

  // Meetings + one-offs
  { id:"adv-1", cat:"personal", key:k(2026,4,7),  title:"Advisor meeting", start:"11:30", end:"12:00" },
  { id:"club-1", cat:"social",  key:k(2026,4,8),  title:"ACM social",      start:"18:00", end:"20:00" },
  { id:"int-1", cat:"personal", key:k(2026,4,12), title:"Internship interview — Stripe", start:"14:00", end:"15:00" },
  { id:"fam-1", cat:"social",   key:k(2026,4,16), title:"Mom's birthday dinner", start:"19:00", end:"21:30" },
  { id:"final-1", cat:"class",  key:k(2026,4,11), title:"CS 374 Midterm",  start:"19:00", end:"21:00", loc:"Siebel 1404" },
  { id:"trip-1", cat:"personal",key:k(2026,4,22), title:"Drive home for weekend", start:"15:00", end:"19:00" },

  // Already-scheduled habits (a few existing ones, mixed in)
  { id:"gym-2", cat:"health", key:k(2026,4,5),  title:"Gym — Push day",  start:"07:00", end:"08:00" },
  { id:"gym-3", cat:"health", key:k(2026,4,3),  title:"Long run",         start:"08:00", end:"09:30" },
  { id:"study-existing-1", cat:"study", key:k(2026,4,4), title:"STAT problem set", start:"19:00", end:"21:00" },
];

// Auto-scheduled "ghost" preview blocks the AI proposes after the chat prompt.
// These are pending — accept or reject each one.
const GHOST_EVENTS = [
  { id:"g-gym-1", cat:"health", key:k(2026,4,7),  title:"Gym — Pull day",   start:"07:00", end:"08:00", reason:"Morning energy block, before classes" },
  { id:"g-gym-2", cat:"health", key:k(2026,4,9),  title:"Gym — Legs",       start:"07:00", end:"08:00", reason:"3rd session, recovery between" },
  { id:"g-gym-3", cat:"health", key:k(2026,4,12), title:"Gym — Push day",   start:"07:00", end:"08:00", reason:"Repeat next week pattern" },
  { id:"g-study-1", cat:"study", key:k(2026,4,7), title:"Deep study — Algo", start:"14:00", end:"16:00", reason:"After classes, before energy dip" },
  { id:"g-study-2", cat:"study", key:k(2026,4,8), title:"Deep study — Stats", start:"15:30", end:"17:30", reason:"Reinforces today's lecture" },
  { id:"g-study-3", cat:"study", key:k(2026,4,10), title:"Review week",     start:"10:00", end:"12:00", reason:"Sat morning, low-stakes review" },
  { id:"g-study-4", cat:"study", key:k(2026,4,13), title:"Deep study — Algo", start:"14:00", end:"16:00", reason:"Repeat weekly pattern" },
  { id:"g-rest-1", cat:"rest",   key:k(2026,4,9),  title:"Walk + reset",     start:"17:00", end:"17:30", reason:"Protected recovery between blocks" },
  { id:"g-rest-2", cat:"rest",   key:k(2026,4,11), title:"Sunday wind-down", start:"20:00", end:"21:00", reason:"Buffer before Monday" },
];

// Streaks
const STREAKS = [
  { label:"Gym",        days: 12, target: 21, cat:"health" },
  { label:"Deep study", days: 5,  target: 14, cat:"study"  },
  { label:"8h sleep",   days: 3,  target: 7,  cat:"rest"   },
];

// Build a lookup: events per date key
function indexEvents(events){
  const map = {};
  for (const e of events){
    if (!map[e.key]) map[e.key] = [];
    map[e.key].push(e);
  }
  for (const k of Object.keys(map)){
    map[k].sort((a,b)=> a.start.localeCompare(b.start));
  }
  return map;
}

function timeToMin(t){ const [h,m]=t.split(":").map(Number); return h*60+m; }
function fmt12(t){
  const [h,m] = t.split(":").map(Number);
  const ap = h>=12 ? "p" : "a";
  const hh = ((h+11)%12)+1;
  return m===0 ? `${hh}${ap}` : `${hh}:${String(m).padStart(2,"0")}${ap}`;
}

// workload (minutes) per day
function workloadFor(dayEvents){
  if (!dayEvents) return 0;
  return dayEvents.reduce((s,e)=> s + (timeToMin(e.end)-timeToMin(e.start)), 0);
}
// 0..1 normalized (10h = full)
function workloadPct(mins){ return Math.min(1, mins/(10*60)); }

// month grid: returns 6×7 array of {y,m,d, inMonth}
function monthGrid(y,m){
  const first = new Date(y,m,1);
  const startDow = first.getDay();
  const daysInMonth = new Date(y,m+1,0).getDate();
  const daysPrev = new Date(y,m,0).getDate();
  const cells = [];
  // leading
  for (let i=startDow-1; i>=0; i--){
    cells.push({ y: m===0?y-1:y, m: m===0?11:m-1, d: daysPrev-i, inMonth:false });
  }
  for (let d=1; d<=daysInMonth; d++){
    cells.push({ y, m, d, inMonth:true });
  }
  while (cells.length % 7 !== 0 || cells.length < 42){
    const last = cells[cells.length-1];
    const nd = new Date(last.y,last.m,last.d); nd.setDate(nd.getDate()+1);
    cells.push({ y:nd.getFullYear(), m:nd.getMonth(), d:nd.getDate(), inMonth: nd.getMonth()===m });
    if (cells.length >= 42) break;
  }
  return cells;
}

function sameDay(a,b){ return a.y===b.y && a.m===b.m && a.d===b.d; }
function dateKey(c){ return k(c.y, c.m, c.d); }
function startOfWeek(c){
  const dt = new Date(c.y, c.m, c.d);
  const dow = dt.getDay();
  dt.setDate(dt.getDate()-dow);
  return { y:dt.getFullYear(), m:dt.getMonth(), d:dt.getDate() };
}
function addDays(c,n){
  const dt = new Date(c.y, c.m, c.d); dt.setDate(dt.getDate()+n);
  return { y:dt.getFullYear(), m:dt.getMonth(), d:dt.getDate() };
}
function inSameWeek(a,b){
  const sa = startOfWeek(a), sb = startOfWeek(b);
  return sa.y===sb.y && sa.m===sb.m && sa.d===sb.d;
}

Object.assign(window, {
  MONTHS, DOW, DOW_SHORT, CATS, TODAY,
  SEED_EVENTS, GHOST_EVENTS, STREAKS,
  indexEvents, timeToMin, fmt12, workloadFor, workloadPct,
  monthGrid, sameDay, dateKey, startOfWeek, addDays, inSameWeek, k
});
