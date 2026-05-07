import { useMemo, useState } from 'react'
import {
  DAYS,
  categoryForItem,
  formatHour12,
  formatTime12,
  formatTimeChip,
  timeToMin,
} from '../constants.js'

const HOUR_PX = 56
const MIN_BLOCK_PX = 22

export default function WeekView({ schedule, onMarkDone, onMarkMissed }) {
  // Compute the visible hour range from the user's wake/sleep window,
  // padded to whole hours so labels read cleanly.
  const startHour = Math.floor(timeToMin(schedule.wake_time) / 60)
  const endHour = Math.ceil(timeToMin(schedule.sleep_time) / 60)
  const hours = useMemo(() => {
    const arr = []
    for (let h = startHour; h <= endHour; h++) arr.push(h)
    return arr
  }, [startHour, endHour])
  const totalHeight = (endHour - startHour) * HOUR_PX

  return (
    <div className="week-view">
      <div className="week-rail">
        <div className="week-rail-spacer" />
        {hours.map((h) => (
          <div key={h} className="week-rail-hour" style={{ height: HOUR_PX }}>
            <span className="mono">{formatHour12(h)}</span>
          </div>
        ))}
      </div>
      <div className="week-columns">
        {DAYS.map((day) => (
          <DayColumn
            key={day}
            day={day}
            placements={schedule.placements.filter((p) => p.day === day)}
            startHour={startHour}
            totalHeight={totalHeight}
            hours={hours}
            onMarkDone={onMarkDone}
            onMarkMissed={onMarkMissed}
          />
        ))}
      </div>
    </div>
  )
}

function DayColumn({
  day,
  placements,
  startHour,
  totalHeight,
  hours,
  onMarkDone,
  onMarkMissed,
}) {
  const [activeId, setActiveId] = useState(null)
  const sorted = [...placements].sort(
    (a, b) => timeToMin(a.start) - timeToMin(b.start),
  )
  const startMin = startHour * 60

  return (
    <div className="week-col">
      <header className="week-col-header">
        <span className="week-col-day">{day.slice(0, 3)}</span>
      </header>
      <div className="week-col-grid" style={{ height: totalHeight }}>
        {hours.slice(0, -1).map((_, i) => (
          <div
            key={i}
            className="week-col-hour-line"
            style={{ top: (i + 1) * HOUR_PX }}
          />
        ))}
        {sorted.map((p) => {
          const sMin = timeToMin(p.start) - startMin
          const dMin = Math.max(15, p.duration)
          const top = (sMin / 60) * HOUR_PX
          const height = Math.max(MIN_BLOCK_PX, (dMin / 60) * HOUR_PX)
          const cat = categoryForItem(p)
          const isFlex = p.kind === 'flex'
          const isUpcoming = isFlex && p.status === 'upcoming'
          const isOpen = activeId === p.id
          return (
            <div
              key={p.id}
              className={`cal-block status-${p.status} ${
                p.kind === 'fixed' ? 'cal-block-fixed' : 'cal-block-flex'
              }`}
              style={{
                top,
                height,
                background: cat.fill,
                color: cat.ink,
              }}
              onClick={() => isUpcoming && setActiveId(isOpen ? null : p.id)}
            >
              <span
                className="cal-block-bar"
                style={{ background: cat.bar }}
                aria-hidden
              />
              <div className="cal-block-row">
                <span className="cal-block-time mono">
                  {formatTimeChip(p.start)}
                </span>
                <span className="cal-block-name">{p.name}</span>
              </div>
              {height > 32 && (
                <div className="cal-block-meta mono">
                  {formatTime12(p.start)} – {formatTime12(p.end)}
                </div>
              )}
              {p.status !== 'upcoming' && (
                <span className="cal-block-status">{p.status}</span>
              )}
              {isUpcoming && isOpen && (
                <div
                  className="cal-block-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => {
                      onMarkDone(p.id)
                      setActiveId(null)
                    }}
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    className="chip-btn chip-btn-warn"
                    onClick={() => {
                      onMarkMissed(p.id)
                      setActiveId(null)
                    }}
                  >
                    Missed
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
