import { useState } from 'react'
import {
  BURNOUT_COLOR_HEX,
  DAYS,
  burnoutColorForScore,
  categoryForItem,
  formatTime12,
  formatTimeChip,
  timeToMin,
} from '../constants.js'

const VARIANT_DESCRIPTIONS = {
  Balanced: 'Spread evenly across the week.',
  Intensive: 'Front-loaded, heavier early in the week.',
  Light: 'Lighter daily load, more spread out.',
}

export default function ScheduleCard({ option, wakeTime, sleepTime, onSelect }) {
  const wakeMin = timeToMin(wakeTime)
  const sleepMin = timeToMin(sleepTime)
  const totalSpan = Math.max(60, sleepMin - wakeMin)

  const color = burnoutColorForScore(option.burnout_score)
  const colorHex = BURNOUT_COLOR_HEX[color]

  const [hovered, setHovered] = useState(false)

  const flexBlocks = option.placements.filter((p) => p.kind === 'flex')
  const fixedBlocks = option.placements.filter((p) => p.kind === 'fixed')

  return (
    <article
      className="schedule-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
    >
      <header className="schedule-card-header">
        <div>
          <h3 className="serif">{option.label}</h3>
          <p className="muted small">{VARIANT_DESCRIPTIONS[option.label]}</p>
        </div>
        <div
          className="burnout-pill"
          style={{
            background: colorHex + '22',
            color: colorHex,
          }}
        >
          <span className="dot" style={{ background: colorHex }} />
          {color} <span className="mono">· {option.burnout_score}/100</span>
        </div>
      </header>

      <div className="mini-calendar-preview">
        {DAYS.map((day) => (
          <div className="mini-col" key={day}>
            <span className="mini-label">{day.slice(0, 3)}</span>
            <div className="mini-track">
              {option.placements
                .filter((p) => p.day === day)
                .map((p) => {
                  const start = timeToMin(p.start)
                  const end = timeToMin(p.end)
                  const top = ((start - wakeMin) / totalSpan) * 100
                  const height = Math.max(
                    2,
                    ((end - start) / totalSpan) * 100,
                  )
                  const cat = categoryForItem(p)
                  return (
                    <div
                      key={p.id}
                      className="mini-block"
                      style={{
                        top: `${top}%`,
                        height: `${height}%`,
                        background: cat.bar,
                      }}
                      title={`${p.name} ${formatTime12(p.start)}`}
                    />
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      <footer className="schedule-card-footer">
        <small className="muted mono">
          {flexBlocks.length} flex · {fixedBlocks.length} fixed
        </small>
        <button type="button" className="btn btn-dark" onClick={onSelect}>
          Select This
        </button>
      </footer>

      {hovered && (
        <div className="schedule-card-preview" role="dialog">
          <div className="schedule-card-preview-head">
            <strong>Preview</strong>
            <span className="muted small mono">
              {flexBlocks.length} flex · {fixedBlocks.length} fixed
            </span>
          </div>
          <div className="schedule-card-preview-grid">
            {DAYS.map((day) => {
              const items = option.placements
                .filter((p) => p.day === day)
                .sort((a, b) => timeToMin(a.start) - timeToMin(b.start))
                .slice(0, 4)
              if (items.length === 0) return null
              return (
                <div key={day} className="schedule-card-preview-day">
                  <span className="day-label">{day.slice(0, 3)}</span>
                  <ul>
                    {items.map((p) => {
                      const c = categoryForItem(p)
                      return (
                        <li
                          key={p.id}
                          style={{
                            background: c.fill,
                            color: c.ink,
                          }}
                        >
                          <span className="hover-time mono">
                            {formatTimeChip(p.start)}
                          </span>
                          <span className="hover-name">{p.name}</span>
                          <span className="hover-full mono">
                            {formatTime12(p.start)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </article>
  )
}
