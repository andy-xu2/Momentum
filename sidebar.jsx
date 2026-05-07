// Momentum — Sidebar (logo, mini month calendar, categories, AI chat panel)

function Logo({ collapsed }){
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"18px 18px 14px"}}>
      <div style={{
        width:28, height:28, borderRadius:8,
        background:"#1a1a1f",
        display:"inline-flex",alignItems:"center",justifyContent:"center",
        boxShadow:"0 4px 12px -4px rgba(26,26,31,0.4), inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}>
        <svg width="16" height="18" viewBox="0 0 16 18" fill="none" aria-hidden="true">
          {/* outer flame */}
          <path d="M8 1.2c0 2.4-2.2 3.6-3.6 5.4C2.8 8.6 2 10.4 2 12.2 2 15.4 4.7 17 8 17s6-1.6 6-4.8c0-2-1-3.6-2.4-5.2-.6-.7-1.1-1.5-1.4-2.4-.2-.6-.3-1.3-.3-2 0-.6-.3-1.4-.9-1.4S8 .6 8 1.2z"
            fill="url(#flameGrad)" />
          {/* inner flame */}
          <path d="M8 7.6c0 1.4-1.3 2-2.1 3-.6.7-.9 1.6-.9 2.4 0 1.7 1.4 2.6 3 2.6s3-.9 3-2.6c0-1-.5-1.9-1.2-2.7-.5-.6-.9-1.1-1.1-1.7-.1-.3-.2-.7-.2-1 0-.3-.2-.7-.5-.7s-.5.4-.5.7z"
            fill="#ffd089" />
        </svg>
        <svg width="0" height="0" style={{position:"absolute"}} aria-hidden="true">
          <defs>
            <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff8fb3" />
              <stop offset="55%" stopColor="#ff7a4a" />
              <stop offset="100%" stopColor="#ffb43c" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div style={{fontFamily:"'Instrument Serif', serif", fontSize:24, lineHeight:1, letterSpacing:"-0.01em"}}>
        Momentum
      </div>
    </div>
  );
}

function MiniMonth({ viewDate, selectedDate, mode, onPickDay, onPickWeek }){
  const grid = monthGrid(viewDate.y, viewDate.m);
  const todayCell = TODAY;
  const cellSize = 28;
  return (
    <div style={{padding:"6px 14px 10px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 6px 8px"}}>
        <div style={{fontSize:12, fontWeight:600, color:"var(--ink)"}}>
          {MONTHS[viewDate.m]} {viewDate.y}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:0,fontSize:10,color:"var(--ink-3)",padding:"0 2px 4px"}}>
        {DOW_SHORT.map((d,i)=> <div key={i} style={{textAlign:"center",height:18,lineHeight:"18px",letterSpacing:"0.04em"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:0,position:"relative"}}>
        {grid.map((c,i)=>{
          const isToday = sameDay(c, todayCell);
          const isSel = sameDay(c, selectedDate);
          const isWeekHL = mode === "week" && inSameWeek(c, selectedDate);
          const dim = !c.inMonth;
          return (
            <button key={i}
              onClick={()=> mode==="week" ? onPickWeek(c) : onPickDay(c)}
              style={{
                appearance:"none", border:"none", background:"transparent", cursor:"pointer",
                height: cellSize, padding:0, position:"relative",
                color: dim ? "var(--ink-3)" : "var(--ink)",
                opacity: dim ? 0.4 : 1,
                fontSize:11, fontWeight: isToday ? 700 : 500,
                fontFamily:"inherit",
              }}>
              {/* week highlight underlay */}
              {isWeekHL && (
                <div style={{
                  position:"absolute", inset:"3px 0", background:"rgba(181,140,255,0.16)",
                  borderRadius: i%7===0 ? "8px 0 0 8px" : (i%7===6 ? "0 8px 8px 0" : 0),
                }} />
              )}
              <div style={{
                position:"relative", width:22, height:22, margin:"3px auto",
                display:"flex",alignItems:"center",justifyContent:"center",
                borderRadius:"50%",
                background: isToday ? "var(--ink)" : (isSel && mode==="day" ? "rgba(181,140,255,0.35)" : "transparent"),
                color: isToday ? "#fff" : "inherit",
              }}>
                {c.d}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Categories({ visible, onToggle }){
  const items = [
    { id:"class", label:"Classes" },
    { id:"study", label:"Study" },
    { id:"health", label:"Health" },
    { id:"social", label:"Social" },
    { id:"rest", label:"Rest" },
    { id:"personal", label:"Personal" },
  ];
  return (
    <div style={{padding:"4px 18px 10px"}}>
      <div style={{fontSize:10,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--ink-3)",margin:"6px 4px 8px"}}>Categories</div>
      <div style={{display:"flex",flexDirection:"column",gap:2}}>
        {items.map(it=>{
          const on = visible[it.id] !== false;
          const c = CATS[it.id];
          return (
            <button key={it.id} onClick={()=>onToggle(it.id)}
              style={{
                appearance:"none",border:"none",background:"transparent",cursor:"pointer",
                display:"flex",alignItems:"center",gap:10,padding:"6px 6px",borderRadius:6,
                fontFamily:"inherit",fontSize:13,color:"var(--ink-2)",textAlign:"left",
                opacity: on ? 1 : 0.5,
              }}>
              <span style={{width:10,height:10,borderRadius:3,background:c.bar,flexShrink:0,boxShadow: on ? "0 0 0 2px "+c.fill : "none"}} />
              <span style={{flex:1}}>{it.label}</span>
              {!on && <span style={{fontSize:10,color:"var(--ink-3)"}}>hidden</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StreaksCard({ streaks }){
  return (
    <div style={{padding:"4px 18px 12px"}}>
      <div style={{fontSize:10,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--ink-3)",margin:"6px 4px 8px"}}>Streaks</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {streaks.map(s=>{
          const c = CATS[s.cat];
          const pct = Math.min(1, s.days/s.target);
          return (
            <div key={s.label} style={{padding:"8px 10px",borderRadius:8,background:"var(--card)",border:"1px solid var(--line)"}}>
              <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:5}}>
                <div style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>{s.label}</div>
                <div style={{fontSize:11,color:"var(--ink-3)",fontFamily:"'JetBrains Mono', monospace"}}>{s.days}/{s.target}d</div>
              </div>
              <div style={{height:4,background:"var(--line-2)",borderRadius:99,overflow:"hidden"}}>
                <div style={{width:`${pct*100}%`, height:"100%", background:c.bar, borderRadius:99}} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AIChatPanel({ onPropose, hasGhosts, ghostCount, onAcceptAll, onClearAll, prompts, setPrompts }){
  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const submit = (text)=>{
    const t = (text ?? input).trim();
    if (!t) return;
    setPrompts(p => [...p, { role:"user", text:t }]);
    setInput("");
    setThinking(true);
    setTimeout(()=>{
      setThinking(false);
      setPrompts(p => [...p, {
        role:"ai",
        text:"Scheduled 9 preview blocks across this week and next. Hover any block to accept or reject."
      }]);
      onPropose();
    }, 900);
  };

  const examples = ["Gym 3× a week, mornings", "6h study for finals", "Read 30 min before bed"];

  return (
    <div style={{
      margin:"4px 14px 14px", borderRadius:12,
      background:"linear-gradient(180deg, rgba(181,140,255,0.18) 0%, rgba(255,143,179,0.12) 60%, rgba(255,185,138,0.10) 100%)",
      border:"1px solid rgba(181,140,255,0.25)",
      overflow:"hidden",
    }}>
      <div style={{padding:"14px 14px 8px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <div style={{
            width:18,height:18,borderRadius:5,background:"var(--grad)",
            boxShadow:"0 2px 6px -1px rgba(181,140,255,0.5)"
          }} />
          <div style={{fontSize:12,fontWeight:600,letterSpacing:"-0.01em"}}>Auto-schedule</div>
          <div style={{marginLeft:"auto",fontSize:10,color:"var(--ink-3)",fontFamily:"'JetBrains Mono',monospace"}}>BETA</div>
        </div>
        <div style={{fontFamily:"'Instrument Serif', serif", fontSize:18, lineHeight:1.2, color:"var(--ink)", marginBottom:10}}>
          What do you want to make time for?
        </div>

        <div style={{
          display:"flex",flexDirection:"column",gap:6,maxHeight:140,overflow:"auto",
          fontSize:12, lineHeight:1.4, marginBottom:8,
        }}>
          {prompts.map((m,i)=>(
            <div key={i} style={{
              alignSelf: m.role==="user" ? "flex-end" : "flex-start",
              maxWidth:"92%",
              padding:"6px 9px",borderRadius:8,
              background: m.role==="user" ? "rgba(255,255,255,0.7)" : "rgba(26,26,31,0.85)",
              color: m.role==="user" ? "var(--ink)" : "#fff",
              border: m.role==="user" ? "1px solid rgba(0,0,0,0.06)" : "none",
            }}>{m.text}</div>
          ))}
          {thinking && (
            <div style={{alignSelf:"flex-start",padding:"6px 9px",borderRadius:8,background:"rgba(26,26,31,0.85)",color:"#fff"}}>
              <span className="dots">Planning your week</span>
            </div>
          )}
        </div>

        {hasGhosts ? (
          <div style={{display:"flex",gap:6,margin:"4px 0 8px"}}>
            <button onClick={onAcceptAll} style={btnPrimaryStyle}>Accept all {ghostCount}</button>
            <button onClick={onClearAll} style={btnSecondaryStyle}>Reject all</button>
          </div>
        ) : (
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
            {examples.map(ex=>(
              <button key={ex} onClick={()=>submit(ex)} style={chipStyle}>{ex}</button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={(e)=>{e.preventDefault(); submit();}} style={{
        display:"flex",alignItems:"center",gap:0,
        background:"rgba(255,255,255,0.85)",
        borderTop:"1px solid rgba(181,140,255,0.2)",
      }}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          placeholder="Tell Momentum what to fit in…"
          style={{
            flex:1,appearance:"none",border:"none",background:"transparent",outline:"none",
            padding:"10px 12px",fontFamily:"inherit",fontSize:12.5,color:"var(--ink)",
          }} />
        <button type="submit" style={{
          appearance:"none",border:"none",background:"var(--grad)",color:"#fff",
          padding:"8px 12px",margin:5,borderRadius:6,fontFamily:"inherit",fontSize:11,fontWeight:600,cursor:"pointer",
          boxShadow:"0 2px 6px -2px rgba(181,140,255,0.6)",
        }}>Plan ↵</button>
      </form>
    </div>
  );
}

const btnPrimaryStyle = {
  appearance:"none",border:"none",cursor:"pointer",fontFamily:"inherit",
  background:"var(--ink)",color:"#fff",borderRadius:6,padding:"6px 10px",fontSize:11,fontWeight:600,flex:1
};
const btnSecondaryStyle = {
  appearance:"none",cursor:"pointer",fontFamily:"inherit",
  background:"transparent",color:"var(--ink-2)",border:"1px solid var(--line)",
  borderRadius:6,padding:"6px 10px",fontSize:11,fontWeight:500
};
const chipStyle = {
  appearance:"none",cursor:"pointer",fontFamily:"inherit",
  background:"rgba(255,255,255,0.7)",color:"var(--ink-2)",border:"1px solid rgba(0,0,0,0.06)",
  borderRadius:99,padding:"4px 9px",fontSize:11,
};

function Sidebar(props){
  return (
    <aside style={{
      width:268,flexShrink:0,
      borderRight:"1px solid var(--line)",
      background:"#fbfaf7",
      display:"flex",flexDirection:"column",
      height:"100vh",overflowY:"auto",
    }}>
      <Logo />
      <MiniMonth {...props} />
      <AIChatPanel {...props} />
      <Categories visible={props.visibleCats} onToggle={props.onToggleCat} />
      <StreaksCard streaks={STREAKS} />
      <div style={{flex:1}} />
      <div style={{padding:"10px 18px 18px",fontSize:10,color:"var(--ink-3)",borderTop:"1px solid var(--line)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:22,height:22,borderRadius:99,background:"linear-gradient(135deg,#6f5af0,#d65a8e)"}} />
          <div>
            <div style={{color:"var(--ink-2)",fontSize:11,fontWeight:500}}>Maya Patel</div>
            <div>UIUC · CS &apos;27</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { Sidebar });
