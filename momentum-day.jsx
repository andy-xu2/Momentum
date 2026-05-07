// Momentum — Day zoom view

function DayView({ date, eventsByDay, ghostsByDay, visibleCats, onAccept, onReject, gradientBg }){
  const dayKey = dateKey(date);
  const dayEvents = (eventsByDay[dayKey] || []).filter(e=> visibleCats[e.cat] !== false);
  const dayGhosts = (ghostsByDay[dayKey] || []).filter(e=> visibleCats[e.cat] !== false);
  const all = [...dayEvents, ...dayGhosts];

  // Hours 6 → 23
  const startHour = 6, endHour = 23;
  const hours = [];
  for (let h=startHour; h<=endHour; h++) hours.push(h);
  const hourH = 60; // px per hour

  const dt = new Date(date.y, date.m, date.d);
  const dow = DOW[dt.getDay()];
  const isToday = sameDay(date, TODAY);

  const totalMins = workloadFor(all);
  const overloaded = totalMins > 9*60;

  return (
    <div style={{
      flex:1,display:"flex",flexDirection:"column",
      background: gradientBg
        ? "radial-gradient(1100px 700px at 80% -10%, rgba(255,143,179,0.16), transparent 60%), radial-gradient(900px 600px at 0% 110%, rgba(181,140,255,0.16), transparent 60%), #fbfaf7"
        : "#fbfaf7",
      overflow:"hidden",
    }}>
      {/* Day sub-header (workload only — date already in top header) */}
      <div style={{
        display:"flex",alignItems:"center",gap:16,
        padding:"10px 24px",borderBottom:"1px solid var(--line)",
        background:"#fbfaf7",
      }}>
        {isToday && (
          <span style={{
            fontSize:10,fontWeight:600,letterSpacing:"0.08em",
            padding:"3px 7px",borderRadius:99,
            background:"var(--ink)",color:"#fff",
          }}>TODAY</span>
        )}
        <div style={{flex:1}} />
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11,color:"var(--ink-3)"}}>Workload</span>
            <div style={{width:80,height:5,background:"var(--line-2)",borderRadius:99,overflow:"hidden"}}>
              <div style={{
                width:`${workloadPct(totalMins)*100}%`,height:"100%",
                background: overloaded ? "#d65a5a" : "var(--cat-class-bar)",
              }} />
            </div>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"var(--ink-2)"}}>
              {(totalMins/60).toFixed(1)}h
            </span>
          </div>
          {overloaded && (
            <span style={{fontSize:10,fontWeight:600,color:"#9c2a2a",background:"#ffe0e0",padding:"3px 7px",borderRadius:99}}>OVERLOADED</span>
          )}
        </div>
      </div>

      {/* Time grid */}
      <div style={{flex:1,display:"flex",overflow:"auto",position:"relative"}}>
        <div style={{flex:1,display:"flex",margin:"0 auto",maxWidth:980,width:"100%",padding:"16px 24px 40px"}}>
          {/* Hours rail */}
          <div style={{width:60,flexShrink:0,position:"relative"}}>
            {hours.map(h=>(
              <div key={h} style={{
                height:hourH,position:"relative",
                fontFamily:"'JetBrains Mono', monospace",fontSize:10,color:"var(--ink-3)",
              }}>
                <span style={{position:"absolute",top:-6,right:8}}>
                  {h===12 ? "12p" : (h>12 ? `${h-12}p` : `${h}a`)}
                </span>
              </div>
            ))}
          </div>

          {/* Event column */}
          <div style={{flex:1,position:"relative",borderLeft:"1px solid var(--line)"}}>
            {hours.map(h=>(
              <div key={h} style={{
                height:hourH,borderBottom:"1px dashed var(--line-2)",position:"relative",
              }}>
                <div style={{position:"absolute",top:hourH/2,left:0,right:0,height:1,background:"var(--line-2)",opacity:0.4}} />
              </div>
            ))}

            {/* Now indicator (for today) */}
            {isToday && (() => {
              const now = new Date(); // visual indicator only
              const nowMin = (10*60 + 30) - startHour*60; // fake "now" 10:30a for illustration
              const top = (nowMin/60)*hourH;
              if (top<0 || top> (endHour-startHour+1)*hourH) return null;
              return (
                <div style={{position:"absolute",left:0,right:0,top:top,zIndex:5,pointerEvents:"none"}}>
                  <div style={{
                    height:2,background:"linear-gradient(90deg, var(--accent-a), var(--accent-b))",
                    boxShadow:"0 0 8px rgba(214,90,142,0.4)",
                  }} />
                  <div style={{
                    position:"absolute",left:-6,top:-4,width:10,height:10,borderRadius:99,
                    background:"var(--accent-b)",boxShadow:"0 0 0 3px rgba(255,143,179,0.25)",
                  }} />
                </div>
              );
            })()}

            {/* Events */}
            {all.map(ev=>{
              const sMin = timeToMin(ev.start) - startHour*60;
              const dMin = timeToMin(ev.end) - timeToMin(ev.start);
              const top = (sMin/60)*hourH;
              const height = (dMin/60)*hourH;
              if (top + height < 0 || top > (endHour-startHour+1)*hourH) return null;
              const isGhost = ev.id?.startsWith("g-");
              const c = CATS[ev.cat];
              return (
                <div key={ev.id+"-"+dayKey} style={{
                  position:"absolute",left:8,right:14,top, height: Math.max(height, 22),
                  background: isGhost ? "transparent" : c.fill,
                  border: isGhost ? `1.5px dashed ${c.bar}` : "none",
                  borderRadius:6,
                  paddingLeft:10,paddingRight:8,paddingTop:5,paddingBottom:4,
                  color: c.ink,
                  overflow:"hidden",
                  boxShadow: isGhost ? "none" : "0 1px 0 rgba(0,0,0,0.03)",
                }}>
                  <div style={{
                    position:"absolute",left:0,top:4,bottom:4,width:3,
                    background:c.bar,borderRadius:99,
                    opacity: isGhost ? 0.55 : 1,
                  }} />
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <div style={{fontWeight:600,fontSize:13,lineHeight:1.2}}>{ev.title}</div>
                    {isGhost && (
                      <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.06em",
                        color:c.bar,padding:"1px 5px",borderRadius:99,boxShadow:`inset 0 0 0 1px ${c.bar}`}}>
                        SUGGESTED
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontFamily:"'JetBrains Mono',monospace",fontSize:10.5,opacity:0.75,marginTop:2,
                  }}>
                    {fmt12(ev.start)} – {fmt12(ev.end)}{ev.loc ? ` · ${ev.loc}` : ""}
                  </div>
                  {isGhost && height>52 && ev.reason && (
                    <div style={{fontSize:11,opacity:0.85,marginTop:4,lineHeight:1.3}}>
                      {ev.reason}
                    </div>
                  )}
                  {isGhost && (
                    <div style={{
                      position:"absolute",right:8,top:6,display:"flex",gap:4,
                    }}>
                      <button onClick={(e)=>{e.stopPropagation(); onAccept(ev);}} style={{
                        appearance:"none",cursor:"pointer",border:"none",fontFamily:"inherit",
                        background:c.bar,color:"#fff",borderRadius:4,padding:"3px 8px",fontSize:10,fontWeight:600,
                      }}>Accept</button>
                      <button onClick={(e)=>{e.stopPropagation(); onReject(ev);}} style={{
                        appearance:"none",cursor:"pointer",fontFamily:"inherit",
                        background:"transparent",color:c.ink,
                        border:`1px solid ${c.bar}`,borderRadius:4,padding:"3px 8px",fontSize:10,fontWeight:500,
                      }}>Reject</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DayView });
