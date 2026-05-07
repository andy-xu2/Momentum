import { categoryForItem, formatTime12 } from '../constants.js'

const STATUS_GROUPS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'done', label: 'Done' },
  { key: 'missed', label: 'Missed' },
]

export default function TaskSidebar({ schedule, onMarkMissed, onMarkDone }) {
  const flex = schedule.placements.filter((p) => p.kind === 'flex')

  return (
    <aside className="task-sidebar">
      <h3 className="serif">Flex Tasks</h3>
      {STATUS_GROUPS.map((group) => {
        const items = flex.filter((p) => p.status === group.key)
        return (
          <section key={group.key} className="task-group">
            <header>
              <h4>{group.label}</h4>
              <span className="badge mono">{items.length}</span>
            </header>
            {items.length === 0 ? (
              <p className="muted small">Nothing here yet.</p>
            ) : (
              <ul className="task-list">
                {items.map((p) => {
                  const cat = categoryForItem(p)
                  return (
                    <li
                      key={p.id}
                      className="task-list-item"
                      style={{ borderLeftColor: cat.bar }}
                    >
                      <div>
                        <strong>{p.name}</strong>
                        <p className="muted small mono">
                          {p.day.slice(0, 3)} · {formatTime12(p.start)} ·{' '}
                          {p.energy}
                        </p>
                      </div>
                      {group.key === 'upcoming' && (
                        <div className="task-actions">
                          <button
                            type="button"
                            className="link-btn"
                            onClick={() => onMarkDone(p.id)}
                          >
                            Done
                          </button>
                          <button
                            type="button"
                            className="link-btn link-btn-warn"
                            onClick={() => onMarkMissed(p.id)}
                          >
                            Mark as Missed
                          </button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )
      })}
    </aside>
  )
}
