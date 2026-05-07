import { useState } from 'react'
import { ENERGY_LEVELS, formatHumanDate, todayIso } from '../constants.js'

const initialDraft = () => ({
  name: '',
  duration: 60,
  energy: 'Medium',
  priority: 3,
  deadline: '',
  occurrences: 1,
})

export default function FlexTaskForm({ onAdd }) {
  const [draft, setDraft] = useState(initialDraft())
  const [errorMsg, setErrorMsg] = useState('')

  function submit(event) {
    event.preventDefault()
    if (!draft.name.trim()) return setErrorMsg('Name required.')
    if (draft.duration < 15) return setErrorMsg('Duration must be at least 15 minutes.')
    if (draft.deadline && draft.deadline < todayIso()) {
      return setErrorMsg('Deadline must be today or later.')
    }

    onAdd({
      ...draft,
      id: crypto.randomUUID(),
      duration: Number(draft.duration),
      priority: Number(draft.priority),
      occurrences: Number(draft.occurrences),
      deadline: draft.deadline || null,
    })
    setDraft(initialDraft())
    setErrorMsg('')
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <input
        type="text"
        placeholder="Task name (e.g. Calc Study Block)"
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
      />
      <div className="grid-2">
        <label>
          Duration (min)
          <input
            type="number"
            min={15}
            step={15}
            value={draft.duration}
            onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
          />
        </label>
        <label>
          Energy
          <select
            value={draft.energy}
            onChange={(e) => setDraft({ ...draft, energy: e.target.value })}
          >
            {ENERGY_LEVELS.map((level) => (
              <option key={level}>{level}</option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select
            value={draft.priority}
            onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value} {value === 5 ? '(highest)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Occurrences / wk
          <input
            type="number"
            min={1}
            max={7}
            value={draft.occurrences}
            onChange={(e) => setDraft({ ...draft, occurrences: e.target.value })}
          />
        </label>
        <label className="grid-span-2">
          Deadline (optional)
          <input
            type="date"
            min={todayIso()}
            value={draft.deadline}
            onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
          />
          {draft.deadline && (
            <span className="form-hint">Due by {formatHumanDate(draft.deadline)}</span>
          )}
        </label>
      </div>
      {errorMsg && <p className="form-error">{errorMsg}</p>}
      <button type="submit" className="btn btn-secondary">
        Add Flex Task
      </button>
    </form>
  )
}
