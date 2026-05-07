// Momentum — Month view (the hero)

function MonthHeader({ viewDate, selectedDate, onPrev, onNext, onToday, mode, onMode, density, onDensity }){
  let titleMain, titleSub;
  if (mode === "day" && selectedDate) {
    const dt = new Date(selectedDate.y, selectedDate.m, selectedDate.d);
    titleMain = `${DOW[dt.getDay()]} ${MONTHS[selectedDate.m].slice(0,3)} ${selectedDate.d}`;
    titleSub = String(selectedDate.y);
  } else if (mode === "week" && selectedDate) {
    const sow = startOfWeek(selectedDate);
    const eow = addDays(sow, 6);
    if (sow.m === eow.m) {
      titleMain = `${MONTHS[sow.m].slice(0,3)} ${sow.d}–${eow.d}`;
    } else {
      titleMain = `${MONTHS[sow.m].slice(0,3)} ${sow.d} – ${MONTHS[eow.m].slice(0,3)} ${eow.d}`;
    }
    titleSub = String(eow.y);
  } else {
    titleMain = MONTHS[viewDate.m];
    titleSub = String(viewDate.y);
  }
  return (
    <div style={{
      display:"flex",alignItems:"center",gap:14,
      padding:"16px 24px 14px",
      borderBottom:"1px solid var(--line)",
      background:"linear-gradient(180deg, rgba(181,140,255,0.10) 0%, rgba(255,143,179,0.05) 35%, rgba(255,255,255,0) 100%)",
      position:"relative",
    }}>
      <div style={{
        display:"inline-flex", alignItems:"center", gap:6,
        background:"#fff", border:"1px solid var(--line)", borderRadius:10,
        padding:"6px 6px 6px 8px",
      }}>
        <IconBtn onClick={onPrev} title="Previous" small>‹</IconBtn>
        <div style={{
          display:"flex", alignItems:"baseline", gap:6,
          padding:"0 6px", minWidth:0,
        }}>
          <div style={{fontFamily:"'Instrument Serif', serif", fontSize:22, lineHeight:1, letterSpacing:"-0.01em", whiteSpace:"nowrap"}}>
            {titleMain}
          </div>
          <div style={{fontFamily:"'Instrument Serif', serif", fontSize:22, lineHeight:1, color:"var(--ink-3)", fontStyle:"italic"}}>
            {titleSub}
          </div>
        </div>
        <IconBtn onClick={onNext} title="Next" small>›</IconBtn>
      </div>
      <button onClick={onToday} style={{
        appearance:"none",cursor:"pointer",fontFamily:"inherit",
        background:"transparent",border:"none",
        padding:"6px 4px",fontSize:12,fontWeight:500,color:"var(--ink-2)",
      }}>Today</button>

      <div style={{flex:1}} />

      <div style={{
        display:"flex",alignItems:"center",gap:0,
        background:"#fff",border:"1px solid var(--line)",borderRadius:8,padding:3,
      }}>
        {["month","week","day"].map(m=>(
          <button key={m} onClick={()=>onMode(m)} style={{
            appearance:"none",cursor:"pointer",border:"none",fontFamily:"inherit",
            padding:"5px 12px",borderRadius:5,fontSize:12,fontWeight:500,
            background: mode===m ? "var(--ink)" : "transparent",
            color: mode===m ? "#fff" : "var(--ink-2)",
            textTransform:"capitalize",
          }}>{m}</button>
        ))}
      </div>

      <button style={{
        appearance:"none",cursor:"pointer",fontFamily:"inherit",
        background:"var(--ink)",color:"#fff",border:"none",borderRadius:6,
        padding:"7px 12px",fontSize:12,fontWeight:500,
      }}>+ Add event</button>
    </div>
  );
}

function IconBtn({children, onClick, title, small}){
  const sz = small ? 24 : 30;
  return (
    <button onClick={onClick} title={title} style={{
      appearance:"none",cursor:"pointer",fontFamily:"inherit",
      width:sz,height:sz,borderRadius:6,
      background: small ? "transparent" : "#fff",
      border: small ? "none" : "1px solid var(--line)",
      color:"var(--ink-2)",fontSize: small ? 18 : 16,lineHeight:1,
      display:"inline-flex",alignItems:"center",justifyContent:"center",
    }}>{children}</button>
  );
}

function WorkloadBar({ mins, overloaded }){
  const pct = workloadPct(mins);
  const hours = (mins/60).toFixed(1);
  return (
    <div title={`${hours}h scheduled`} style={{
      position:"absolute", top:3, right:5, display:"flex",alignItems:"center",gap:4,
    }}>
      {overloaded && (
        <span style={{
          fontSize:9,fontWeight:600,color:"#9c2a2a",
          background:"#ffe0e0",padding:"1px 5px",borderRadius:99,letterSpacing:"0.02em",
        }}>HEAVY</span>
      )}
      <div style={{
        width:24, height:3, borderRadius:99, background:"var(--line-2)", overflow:"hidden",
      }}>
        <div style={{
          width:`${pct*100}%`, height:"100%",
          background: overloaded ? "#d65a5a" : "var(--cat-class-bar)",
          borderRadius:99,
        }} />
      </div>
    </div>
  );
}

function EventChip({ event, ghost, density, onAccept, onReject, onClick }){
  const c = CATS[event.cat];
  const compact = density === "compact";
  return (
    <div onClick={(e)=>{ e.stopPropagation(); onClick && onClick(event); }} style={{
      position:"relative",
      padding: compact ? "1px 5px 1px 7px" : "2px 6px 2px 8px",
      marginBottom: compact ? 1 : 2,
      borderRadius:4,
      background: ghost ? "transparent" : c.fill,
      border: ghost ? `1px dashed ${c.bar}` : "none",
      color: c.ink,
      fontSize: compact ? 10.5 : 11,
      lineHeight: 1.25,
      cursor:"pointer",
      overflow:"hidden",
      whiteSpace:"nowrap",
      textOverflow:"ellipsis",
      opacity: ghost ? 0.92 : 1,
    }}>
      <div style={{
        position:"absolute",left:0,top:1,bottom:1,width:2,
        background: c.bar, borderRadius:99,
        opacity: ghost ? 0.5 : 1,
      }} />
      <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: compact ? 9.5 : 10, opacity:0.75, marginRight:4}}>
        {fmt12(event.start)}
      </span>
      <span style={{fontWeight: ghost ? 500 : 500}}>{event.title}</span>
      {ghost && (
        <span style={{
          marginLeft:6, display:"inline-flex", gap:3, verticalAlign:"middle",
        }} onClick={(e)=>e.stopPropagation()}>
          <button onClick={()=>onAccept(event)} style={ghostActionStyle(c.bar, true)} title={`Accept · ${event.reason || ""}`}>✓</button>
          <button onClick={()=>onReject(event)} style={ghostActionStyle(c.bar, false)} title="Reject">✕</button>
        </span>
      )}
    </div>
  );
}
function ghostActionStyle(color, primary){
  return {
    appearance:"none",cursor:"pointer",border:"none",fontFamily:"inherit",
    width:14,height:14,borderRadius:3,
    background: primary ? color : "transparent",
    color: primary ? "#fff" : color,
    fontSize:9, fontWeight:700, lineHeight:1,
    display:"inline-flex",alignItems:"center",justifyContent:"center",
    boxShadow: primary ? "none" : `inset 0 0 0 1px ${color}`,
  };
}

function MonthGrid({ viewDate, selectedDate, mode, eventsByDay, ghostsByDay, visibleCats, onPickDay, onAccept, onReject, density, gradientBg, onPickWeek }){
  const grid = monthGrid(viewDate.y, viewDate.m);
  const rows = [];
  for (let r=0; r<6; r++) rows.push(grid.slice(r*7, r*7+7));
  const rowH = density==="compact" ? 96 : 124;

  const filterCats = (list)=> (list||[]).filter(e=> visibleCats[e.cat] !== false);

  return (
    <div style={{
      flex:1,display:"flex",flexDirection:"column",
      background: gradientBg
        ? "radial-gradient(1100px 600px at 80% -20%, rgba(255,143,179,0.18), transparent 60%), radial-gradient(900px 500px at 0% 110%, rgba(181,140,255,0.18), transparent 55%), #fbfaf7"
        : "#fbfaf7",
      overflow:"hidden",
    }}>
      {/* Day-of-week header */}
      <div style={{
        display:"grid",gridTemplateColumns:"repeat(7, 1fr)",
        borderBottom:"1px solid var(--line)",
        background:"#fbfaf7",
      }}>
        {DOW.map((d,i)=>(
          <div key={d} style={{
            padding:"8px 12px",fontSize:10,letterSpacing:"0.08em",textTransform:"uppercase",
            color:"var(--ink-3)",fontWeight:600,
            borderLeft: i===0 ? "none" : "1px solid var(--line)",
          }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"auto"}}>
        {rows.map((row, ri)=>(
          <div key={ri} style={{
            display:"grid",gridTemplateColumns:"repeat(7, 1fr)",
            borderBottom: ri===5 ? "none" : "1px solid var(--line)",
            minHeight: rowH, position:"relative",
          }}>
            {/* week highlight underlay */}
            {mode==="week" && row.some(c=> inSameWeek(c, selectedDate)) && (
              <div style={{
                position:"absolute",inset:0,
                background:"linear-gradient(90deg, rgba(181,140,255,0.10), rgba(255,143,179,0.08))",
                pointerEvents:"none",
              }} />
            )}
            {row.map((c, ci)=>{
              const dayKey = dateKey(c);
              const dayEv = filterCats(eventsByDay[dayKey]);
              const dayGh = filterCats(ghostsByDay[dayKey]);
              const isToday = sameDay(c, TODAY);
              const isSel = sameDay(c, selectedDate) && mode==="day";
              const dim = !c.inMonth;
              const totalMins = workloadFor([...dayEv, ...dayGh]);
              const overloaded = totalMins > 9*60;
              const visibleCount = dayEv.length + dayGh.length;
              const SHOWN = density==="compact" ? 4 : 5;
              const overflow = Math.max(0, visibleCount - SHOWN);

              return (
                <div key={ci}
                  onClick={()=> mode==="week" ? onPickWeek(c) : onPickDay(c)}
                  style={{
                    position:"relative",
                    borderLeft: ci===0 ? "none" : "1px solid var(--line)",
                    padding:"4px 5px 4px 5px",
                    background: isSel ? "rgba(181,140,255,0.06)" : (dim ? "rgba(0,0,0,0.012)" : "transparent"),
                    cursor:"pointer",
                    overflow:"hidden",
                  }}>
                  <div style={{
                    display:"flex",alignItems:"center",gap:6,padding:"2px 4px 4px",
                  }}>
                    <span style={{
                      display:"inline-flex",alignItems:"center",justifyContent:"center",
                      minWidth:20,height:20,padding:"0 5px",borderRadius:99,
                      background: isToday ? "var(--ink)" : "transparent",
                      color: isToday ? "#fff" : (dim ? "var(--ink-3)" : "var(--ink)"),
                      fontSize:11.5, fontWeight:600,
                      opacity: dim ? 0.55 : 1,
                    }}>{c.d}</span>
                    {ri===0 || c.d===1 ? (
                      <span style={{fontSize:10,color:"var(--ink-3)",letterSpacing:"0.04em"}}>{MONTHS[c.m].slice(0,3)}</span>
                    ) : null}
                  </div>

                  {totalMins>0 && c.inMonth && (
                    <WorkloadBar mins={totalMins} overloaded={overloaded} />
                  )}

                  <div style={{paddingTop:1}}>
                    {[...dayEv, ...dayGh].slice(0,SHOWN).map(ev => {
                      const isGhost = ev.id?.startsWith("g-");
                      return (
                        <EventChip key={ev.id+"-"+dayKey}
                          event={ev}
                          ghost={isGhost}
                          density={density}
                          onAccept={onAccept}
                          onReject={onReject}
                        />
                      );
                    })}
                    {overflow>0 && (
                      <div style={{
                        fontSize:10,color:"var(--ink-3)",padding:"2px 6px",fontWeight:500,
                      }}>+{overflow} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { MonthHeader, MonthGrid });
