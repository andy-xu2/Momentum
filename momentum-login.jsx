// Momentum — Login page

function LoginPage({ onLogin }){
  const [email, setEmail] = React.useState("maya@illinois.edu");
  const [password, setPassword] = React.useState("••••••••");
  const [loading, setLoading] = React.useState(false);

  const submit = (e)=>{
    e.preventDefault();
    setLoading(true);
    setTimeout(()=> onLogin(), 700);
  };

  return (
    <div style={{
      minHeight:"100vh",display:"flex",
      background: "radial-gradient(900px 600px at 80% -10%, rgba(255,143,179,0.30), transparent 60%), radial-gradient(800px 500px at -10% 110%, rgba(181,140,255,0.30), transparent 60%), radial-gradient(700px 500px at 110% 110%, rgba(255,185,138,0.20), transparent 55%), #fbfaf7",
      fontFamily:"Inter, system-ui, sans-serif",
    }}>
      {/* Left — hero copy */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column", justifyContent:"space-between",
        padding:"40px 56px", maxWidth:680,
      }}>
        {/* Brand */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{
            width:32, height:32, borderRadius:9, background:"#1a1a1f",
            display:"inline-flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 4px 12px -4px rgba(26,26,31,0.4), inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}>
            <svg width="18" height="20" viewBox="0 0 16 18" fill="none" aria-hidden="true">
              <path d="M8 1.2c0 2.4-2.2 3.6-3.6 5.4C2.8 8.6 2 10.4 2 12.2 2 15.4 4.7 17 8 17s6-1.6 6-4.8c0-2-1-3.6-2.4-5.2-.6-.7-1.1-1.5-1.4-2.4-.2-.6-.3-1.3-.3-2 0-.6-.3-1.4-.9-1.4S8 .6 8 1.2z" fill="url(#flameGradLogin)" />
              <path d="M8 7.6c0 1.4-1.3 2-2.1 3-.6.7-.9 1.6-.9 2.4 0 1.7 1.4 2.6 3 2.6s3-.9 3-2.6c0-1-.5-1.9-1.2-2.7-.5-.6-.9-1.1-1.1-1.7-.1-.3-.2-.7-.2-1 0-.3-.2-.7-.5-.7s-.5.4-.5.7z" fill="#ffd089" />
              <defs>
                <linearGradient id="flameGradLogin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff8fb3" />
                  <stop offset="55%" stopColor="#ff7a4a" />
                  <stop offset="100%" stopColor="#ffb43c" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div style={{fontFamily:"'Instrument Serif', serif", fontSize:26, lineHeight:1, letterSpacing:"-0.01em"}}>
            Momentum
          </div>
        </div>

        {/* Headline */}
        <div style={{maxWidth:520}}>
          <div style={{
            fontFamily:"'Instrument Serif', serif",
            fontSize:48, lineHeight:1.05, letterSpacing:"-0.02em",
            color:"var(--ink)", marginBottom:22,
          }}>
            A calendar that <span style={{fontStyle:"italic", color:"#7a3f8a"}}>protects</span> your week, not just fills it.
          </div>
          <div style={{fontSize:15, lineHeight:1.55, color:"var(--ink-2)", maxWidth:440}}>
            Drop in your classes. Tell us what else matters — gym, study, sleep — and Momentum finds the time. Built for students who don't want their calendar to be the thing that burns them out.
          </div>
        </div>

        {/* Footer row */}
        <div style={{display:"flex",alignItems:"center",gap:18,fontSize:11,color:"var(--ink-3)"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:6,height:6,borderRadius:99,background:"#3a9c6b"}} />
            All systems normal
          </div>
          <span>·</span>
          <span>SOC 2 · FERPA-aligned</span>
          <span>·</span>
          <span>Free for students</span>
        </div>
      </div>

      {/* Right — login card */}
      <div style={{
        flex:1, display:"flex", alignItems:"center", justifyContent:"center",
        padding:"40px 56px",
      }}>
        <div style={{
          width:"100%", maxWidth:380,
          background:"#fff", borderRadius:16,
          border:"1px solid rgba(0,0,0,0.05)",
          boxShadow:"0 30px 60px -25px rgba(60,30,90,0.18), 0 8px 24px -12px rgba(60,30,90,0.10)",
          overflow:"hidden",
        }}>
          <div style={{padding:"28px 28px 6px"}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--ink-2)",letterSpacing:"-0.01em"}}>Welcome back</div>
            <div style={{fontFamily:"'Instrument Serif', serif", fontSize:28, lineHeight:1.1, letterSpacing:"-0.01em", marginTop:4}}>
              Sign in to Momentum
            </div>
          </div>

          <form onSubmit={submit} style={{padding:"18px 28px 22px",display:"flex",flexDirection:"column",gap:10}}>
            <button type="button" style={ssoBtnStyle}>
              <GoogleG /> Continue with Google
            </button>
            <button type="button" style={ssoBtnStyle}>
              <SchoolIcon /> Continue with School SSO
            </button>

            <div style={{display:"flex",alignItems:"center",gap:10,margin:"6px 0"}}>
              <div style={{flex:1,height:1,background:"var(--line)"}} />
              <div style={{fontSize:10,letterSpacing:"0.1em",color:"var(--ink-3)",textTransform:"uppercase"}}>or</div>
              <div style={{flex:1,height:1,background:"var(--line)"}} />
            </div>

            <Field label="Email">
              <input value={email} onChange={e=>setEmail(e.target.value)}
                type="email" placeholder="you@school.edu" style={inputStyle} />
            </Field>
            <Field label="Password" right={<a href="#" style={linkStyle}>Forgot?</a>}>
              <input value={password} onChange={e=>setPassword(e.target.value)}
                type="password" style={inputStyle} />
            </Field>

            <button type="submit" disabled={loading} style={{
              appearance:"none",cursor: loading?"wait":"pointer",border:"none",fontFamily:"inherit",
              background:"#1a1a1f",color:"#fff",borderRadius:8,padding:"11px 14px",fontSize:13,fontWeight:600,
              marginTop:4,
              boxShadow:"0 4px 14px -6px rgba(26,26,31,0.45)",
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? "Signing in…" : "Sign in →"}
            </button>

            <div style={{fontSize:11.5,color:"var(--ink-3)",textAlign:"center",marginTop:6}}>
              New here? <a href="#" style={linkStyle}>Create an account</a>
            </div>
          </form>

          <div style={{
            padding:"12px 28px",
            background:"linear-gradient(180deg, rgba(255,143,179,0.06), rgba(181,140,255,0.06))",
            borderTop:"1px solid var(--line)",
            display:"flex",alignItems:"center",gap:8,
            fontSize:11,color:"var(--ink-2)",
          }}>
            <span style={{
              display:"inline-flex",alignItems:"center",justifyContent:"center",
              width:18,height:18,borderRadius:5,background:"#fff",border:"1px solid var(--line)",
              fontSize:11,
            }}>🔥</span>
            <span><strong style={{color:"var(--ink)"}}>12-day streak</strong> waiting — pick up where you left off.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, right, children }){
  return (
    <label style={{display:"flex",flexDirection:"column",gap:5}}>
      <span style={{
        display:"flex",alignItems:"center",justifyContent:"space-between",
        fontSize:11,fontWeight:600,color:"var(--ink-2)",letterSpacing:"0.01em",
      }}>
        <span>{label}</span>
        {right}
      </span>
      {children}
    </label>
  );
}

const inputStyle = {
  appearance:"none",border:"1px solid var(--line)",background:"#fff",
  borderRadius:7,padding:"9px 11px",fontFamily:"inherit",fontSize:13,color:"var(--ink)",
  outline:"none",
};
const ssoBtnStyle = {
  appearance:"none",cursor:"pointer",fontFamily:"inherit",
  display:"flex",alignItems:"center",justifyContent:"center",gap:9,
  background:"#fff",color:"var(--ink)",border:"1px solid var(--line)",
  borderRadius:8,padding:"10px 12px",fontSize:13,fontWeight:500,
};
const linkStyle = {
  fontSize:11,fontWeight:500,color:"#7a3f8a",textDecoration:"none",
};

function GoogleG(){
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8c-.2 1.1-.8 2.1-1.8 2.7v2.3h2.9c1.7-1.6 2.7-3.9 2.7-6.6z" fill="#4285F4"/>
      <path d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3C2.4 15.9 5.4 18 9 18z" fill="#34A853"/>
      <path d="M3.9 10.7c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V5H.9C.3 6.2 0 7.6 0 9s.3 2.8.9 4l3-2.3z" fill="#FBBC05"/>
      <path d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6C13.5.9 11.4 0 9 0 5.4 0 2.4 2.1.9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z" fill="#EA4335"/>
    </svg>
  );
}
function SchoolIcon(){
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 6L8 2.5 15 6 8 9.5 1 6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M4 7.5V11c0 1 1.8 2 4 2s4-1 4-2V7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M14 6.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

Object.assign(window, { LoginPage });
