// Momentum — App shell: state, tweaks, routing between month/week/day

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "lavender",
  "density": "comfortable",
  "gradientBg": false
}/*EDITMODE-END*/;

const PALETTES = {
  lavender: { a:"#b58cff", b:"#ff8fb3", c:"#ffb98a", label:"Lavender → Coral" },
  ocean:    { a:"#7cc5ff", b:"#8fa3ff", c:"#b58cff", label:"Sky → Lavender" },
  forest:   { a:"#9bd9b1", b:"#7cc5b8", c:"#a3c9ff", label:"Sage → Mist" },
  sunrise:  { a:"#ffb98a", b:"#ff8fb3", c:"#f5d36e", label:"Coral → Honey" },
};

function applyPaletteVar(p){
  const root = document.documentElement;
  root.style.setProperty("--accent-a", p.a);
  root.style.setProperty("--accent-b", p.b);
  root.style.setProperty("--accent-c", p.c);
}

function App(){
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [authed, setAuthed] = React.useState(false);
  const [viewDate, setViewDate] = React.useState({ y: TODAY.y, m: TODAY.m, d: 1 });
  const [selectedDate, setSelectedDate] = React.useState(TODAY);
  const [mode, setMode] = React.useState("month"); // month | week | day
  const [events, setEvents] = React.useState(SEED_EVENTS);
  const [ghosts, setGhosts] = React.useState([]); // empty until AI proposes
  const [visibleCats, setVisibleCats] = React.useState({class:true,study:true,health:true,social:true,rest:true,personal:true});
  const [prompts, setPrompts] = React.useState([
    { role:"ai", text:"Hey Maya. Tell me what you want to fit in this week and I'll find the time." }
  ]);

  React.useEffect(()=>{ applyPaletteVar(PALETTES[tweaks.palette] || PALETTES.lavender); }, [tweaks.palette]);

  const eventsByDay = React.useMemo(()=> indexEvents(events), [events]);
  const ghostsByDay = React.useMemo(()=> indexEvents(ghosts), [ghosts]);

  const propose = ()=> setGhosts(GHOST_EVENTS);
  const acceptOne = (g)=>{
    setEvents(es => [...es, { ...g, id: g.id.replace(/^g-/, "a-") }]);
    setGhosts(gs => gs.filter(x=> x.id !== g.id));
  };
  const rejectOne = (g)=> setGhosts(gs => gs.filter(x=> x.id !== g.id));
  const acceptAll = ()=>{
    setEvents(es => [...es, ...ghosts.map(g=>({ ...g, id: g.id.replace(/^g-/, "a-") }))]);
    setGhosts([]);
  };
  const clearAll = ()=> setGhosts([]);

  const goPrev = ()=>{
    if (mode === "day") {
      setSelectedDate(s=>{
        const c = addDays(s, -1);
        if (c.m !== viewDate.m || c.y !== viewDate.y) setViewDate({y:c.y,m:c.m,d:1});
        return c;
      });
      return;
    }
    if (mode === "week") {
      setSelectedDate(s=>{
        const c = addDays(s, -7);
        if (c.m !== viewDate.m || c.y !== viewDate.y) setViewDate({y:c.y,m:c.m,d:1});
        return c;
      });
      return;
    }
    setViewDate(v=>{
      const m = v.m===0 ? 11 : v.m-1;
      const y = v.m===0 ? v.y-1 : v.y;
      return {y,m,d:1};
    });
  };
  const goNext = ()=>{
    if (mode === "day") {
      setSelectedDate(s=>{
        const c = addDays(s, 1);
        if (c.m !== viewDate.m || c.y !== viewDate.y) setViewDate({y:c.y,m:c.m,d:1});
        return c;
      });
      return;
    }
    if (mode === "week") {
      setSelectedDate(s=>{
        const c = addDays(s, 7);
        if (c.m !== viewDate.m || c.y !== viewDate.y) setViewDate({y:c.y,m:c.m,d:1});
        return c;
      });
      return;
    }
    setViewDate(v=>{
      const m = v.m===11 ? 0 : v.m+1;
      const y = v.m===11 ? v.y+1 : v.y;
      return {y,m,d:1};
    });
  };
  const goToday = ()=>{
    setViewDate({ y:TODAY.y, m:TODAY.m, d:1 });
    setSelectedDate(TODAY);
  };
  const pickDay = (c)=>{
    setSelectedDate(c);
    setMode("day");
    if (c.m !== viewDate.m || c.y !== viewDate.y) setViewDate({ y:c.y, m:c.m, d:1 });
  };
  const pickWeek = (c)=>{
    setSelectedDate(c);
    setMode("week");
    if (c.m !== viewDate.m || c.y !== viewDate.y) setViewDate({ y:c.y, m:c.m, d:1 });
  };
  const toggleCat = (id)=> setVisibleCats(v=> ({...v, [id]: !(v[id]!==false ? true : false) || (v[id]===false) }));
  // simpler:
  const toggleCatSimple = (id)=> setVisibleCats(v=> ({...v, [id]: v[id]===false ? true : false}));

  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden"}} data-screen-label={authed ? "Momentum Calendar" : "Momentum Login"}>
      {!authed ? <LoginPage onLogin={()=>setAuthed(true)} /> : (<>
      <Sidebar
        viewDate={viewDate}
        selectedDate={selectedDate}
        mode={mode}
        onPickDay={pickDay}
        onPickWeek={pickWeek}
        visibleCats={visibleCats}
        onToggleCat={toggleCatSimple}
        onPropose={propose}
        hasGhosts={ghosts.length>0}
        ghostCount={ghosts.length}
        onAcceptAll={acceptAll}
        onClearAll={clearAll}
        prompts={prompts}
        setPrompts={setPrompts}
      />

      <main style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
        <MonthHeader
          viewDate={viewDate}
          selectedDate={selectedDate}
          onPrev={goPrev}
          onNext={goNext}
          onToday={goToday}
          mode={mode}
          onMode={setMode}
          density={tweaks.density}
          onDensity={(d)=>setTweak("density", d)}
        />
        {mode === "day" ? (
          <DayView
            date={selectedDate}
            eventsByDay={eventsByDay}
            ghostsByDay={ghostsByDay}
            visibleCats={visibleCats}
            onAccept={acceptOne}
            onReject={rejectOne}
            gradientBg={tweaks.gradientBg}
          />
        ) : (
          <MonthGrid
            viewDate={viewDate}
            selectedDate={selectedDate}
            mode={mode}
            eventsByDay={eventsByDay}
            ghostsByDay={ghostsByDay}
            visibleCats={visibleCats}
            onPickDay={pickDay}
            onPickWeek={pickWeek}
            onAccept={acceptOne}
            onReject={rejectOne}
            density={tweaks.density}
            gradientBg={tweaks.gradientBg}
          />
        )}

        {/* Pending suggestions banner */}
        {ghosts.length>0 && (
          <div style={{
            position:"absolute",bottom:18,left:"50%",transform:"translateX(-50%)",
            display:"flex",alignItems:"center",gap:10,
            padding:"8px 14px",borderRadius:99,
            background:"rgba(26,26,31,0.92)",color:"#fff",
            boxShadow:"0 12px 30px -12px rgba(26,26,31,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
            backdropFilter:"blur(8px)",
            fontSize:12,fontWeight:500,
          }}>
            <span style={{
              width:8,height:8,borderRadius:99,
              background:"var(--grad)",
              boxShadow:"0 0 8px rgba(255,143,179,0.7)",
            }} />
            <span>{ghosts.length} suggested blocks waiting</span>
            <button onClick={acceptAll} style={{
              appearance:"none",cursor:"pointer",border:"none",fontFamily:"inherit",
              background:"#fff",color:"var(--ink)",borderRadius:99,padding:"4px 11px",fontSize:11,fontWeight:600,
            }}>Accept all</button>
            <button onClick={clearAll} style={{
              appearance:"none",cursor:"pointer",fontFamily:"inherit",
              background:"transparent",color:"#fff",border:"1px solid rgba(255,255,255,0.25)",
              borderRadius:99,padding:"4px 11px",fontSize:11,fontWeight:500,
            }}>Reject all</button>
          </div>
        )}
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Palette">
          <TweakSelect
            value={tweaks.palette}
            options={Object.keys(PALETTES).map(k=>({value:k,label:PALETTES[k].label}))}
            onChange={(v)=> setTweak("palette", v)}
          />
          <div style={{display:"flex",gap:6,marginTop:8}}>
            {Object.keys(PALETTES).map(key=>{
              const p = PALETTES[key];
              const sel = tweaks.palette === key;
              return (
                <button key={key} onClick={()=>setTweak("palette", key)} style={{
                  appearance:"none",cursor:"pointer",border:sel?"2px solid #fff":"2px solid transparent",
                  outline: sel ? "2px solid var(--ink)" : "none",
                  width:36,height:36,borderRadius:8,padding:0,
                  background:`linear-gradient(135deg, ${p.a}, ${p.b} 55%, ${p.c})`,
                  boxShadow: sel ? "0 4px 10px -3px rgba(0,0,0,0.25)" : "none",
                }} title={p.label} />
              );
            })}
          </div>
        </TweakSection>

        <TweakSection title="Density">
          <TweakRadio
            value={tweaks.density}
            options={[{value:"comfortable",label:"Comfortable"},{value:"compact",label:"Compact"}]}
            onChange={(v)=>setTweak("density", v)}
          />
        </TweakSection>

        <TweakSection title="Background">
          <TweakToggle
            value={tweaks.gradientBg}
            label="Gradient wash on calendar"
            onChange={(v)=>setTweak("gradientBg", v)}
          />
        </TweakSection>
      </TweaksPanel>
      </>)}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
