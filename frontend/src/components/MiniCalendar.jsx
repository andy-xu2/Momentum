import { useMemo } from 'react'
import {
  DOW_SHORT,
  MONTH_LABELS,
  dateFromIso,
  isoFromDate,
  monthGrid,
} from '../constants.js'

export default function MiniCalendar({ todayIso, anchorIso }) {
  const anchor = anchorIso ? dateFromIso(anchorIso) : new Date()

  const cells = useMemo(
    () => monthGrid(anchor.getFullYear(), anchor.getMonth()),
    [anchor],
  )

  return (
    <div className="mini-calendar">
      <div className="mini-cal-title">
        {MONTH_LABELS[anchor.getMonth()]} {anchor.getFullYear()}
      </div>
      <div className="mini-cal-dow-row">
        {DOW_SHORT.map((d, i) => (
          <div key={`dow-${i}`} className="mini-cal-dow">
            {d}
          </div>
        ))}
      </div>
      <div className="mini-cal-grid">
        {cells.map((c) => {
          const cellDate = new Date(c.y, c.m, c.d)
          const iso = isoFromDate(cellDate)
          const isToday = iso === todayIso
          return (
            <button
              key={iso}
              type="button"
              className={`mini-cal-cell ${c.inMonth ? '' : 'mini-cal-out'} ${
                isToday ? 'mini-cal-today' : ''
              }`}
              tabIndex={-1}
            >
              <span>{c.d}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
