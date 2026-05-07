export default function StreaksPanel({ streaks }) {
  const entries = Object.values(streaks || {})
    .filter((s) => s && s.current > 0 && s.goal > 0)
    .sort((a, b) => b.current - a.current)
    .slice(0, 6)

  if (entries.length === 0) {
    // Hide the section entirely when there's no real activity yet so the
    // sidebar never shows fake streak counters.
    return null
  }

  return (
    <section className="streaks-panel">
      <div className="sidebar-section-title">Streaks</div>
      <ul className="streaks-list">
        {entries.map((s) => {
          const ratio = Math.min(1, s.current / Math.max(1, s.goal))
          return (
            <li key={s.name} className="streak-item">
              <div className="streak-row">
                <span className="streak-name">{s.name}</span>
                <span className="streak-count mono">
                  {s.current}/{s.goal}d
                </span>
              </div>
              <div className="streak-bar">
                <div
                  className="streak-bar-fill"
                  style={{ width: `${ratio * 100}%`, background: s.color }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
