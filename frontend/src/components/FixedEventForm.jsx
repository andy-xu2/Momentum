import { useState } from 'react'
import { DAYS, formatTime12 } from '../constants.js'

const initialDraft = {
  name: '',
  days: [],
  start: '09:00',
  end: '10:00',
}

export default function FixedEventForm({ onAdd }) {
  const [draft, setDraft] = useState(initialDraft)
  const [errorMsg, setErrorMsg] = useState('')

  function toggleDay(day) {
    setDraft((d) =>
      d.days.includes(day)
        ? { ...d, days: d.days.filter((x) => x !== day) }
        : { ...d, days: [...d.days, day] },
    )
  }

  function submit(event) {
    event.preventDefault()
    if (!draft.name.trim()) return setErrorMsg('Name required.')
    if (draft.days.length === 0) return setErrorMsg('Pick at least one day.')
    if (draft.start >= draft.end)
      return setErrorMsg('End time must be after start.')

    onAdd({ ...draft, id: crypto.randomUUID() })
    setDraft(initialDraft)
    setErrorMsg('')
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <input
        type="text"
        placeholder="Event name (e.g. Calc 2 Lecture)"
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
      />
      <div className="day-chips">
        {DAYS.map((day) => (
          <button
            type="button"
            key={day}
            className={`chip ${draft.days.includes(day) ? 'active' : ''}`}
            onClick={() => toggleDay(day)}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>
      <div className="time-pair">
        <label>
          <span className="form-label">Starts</span>
          <input
            type="time"
            value={draft.start}
            onChange={(e) => setDraft({ ...draft, start: e.target.value })}
          />
          <span className="time-field-display">{formatTime12(draft.start)}</span>
        </label>
        <label>
          <span className="form-label">Ends</span>
          <input
            type="time"
            value={draft.end}
            onChange={(e) => setDraft({ ...draft, end: e.target.value })}
          />
          <span className="time-field-display">{formatTime12(draft.end)}</span>
        </label>
      </div>
      {errorMsg && <p className="form-error">{errorMsg}</p>}
      <button type="submit" className="btn btn-secondary">
        Add Fixed Event
      </button>
    </form>
  )
}
