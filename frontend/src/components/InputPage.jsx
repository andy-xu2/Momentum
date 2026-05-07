import FixedEventForm from './FixedEventForm.jsx'
import FlexTaskForm from './FlexTaskForm.jsx'
import { formatHumanDate, formatTime12 } from '../constants.js'

export default function InputPage({
  wakeTime,
  sleepTime,
  fixedEvents,
  flexTasks,
  loading,
  onWakeTimeChange,
  onSleepTimeChange,
  onFixedEventsChange,
  onFlexTasksChange,
  onBuildWeek,
}) {
  function removeFixed(id) {
    onFixedEventsChange(fixedEvents.filter((e) => e.id !== id))
  }
  function removeFlex(id) {
    onFlexTasksChange(flexTasks.filter((t) => t.id !== id))
  }

  const canBuild = flexTasks.length > 0 && !loading

  return (
    <div className="input-page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="serif">Plan your week</h2>
            <p className="muted">
              Set your task window, drop in your fixed commitments, and add the
              flex tasks Momentum will schedule for you.
            </p>
          </div>
        </div>
        <div className="time-row">
          <label className="time-field">
            <span className="time-field-label">
              Earliest time I want to start tasks
            </span>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => onWakeTimeChange(e.target.value)}
            />
            <span className="time-field-display mono">{formatTime12(wakeTime)}</span>
          </label>
          <label className="time-field">
            <span className="time-field-label">
              Latest time I want to start tasks
            </span>
            <input
              type="time"
              value={sleepTime}
              onChange={(e) => onSleepTimeChange(e.target.value)}
            />
            <span className="time-field-display mono">{formatTime12(sleepTime)}</span>
          </label>
        </div>
      </section>

      <div className="two-column">
        <section className="panel">
          <div className="panel-header">
            <h3 className="serif">Fixed Events</h3>
            <span className="badge mono">{fixedEvents.length}</span>
          </div>
          <FixedEventForm
            onAdd={(event) => onFixedEventsChange([...fixedEvents, event])}
          />
          <div className="cards-grid">
            {fixedEvents.length === 0 && (
              <p className="empty">
                Classes, work shifts, and club meetings live here.
              </p>
            )}
            {fixedEvents.map((event) => (
              <article key={event.id} className="card fixed-card">
                <div className="card-row">
                  <strong>{event.name}</strong>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => removeFixed(event.id)}
                  >
                    Remove
                  </button>
                </div>
                <p className="muted">
                  {event.days.map((d) => d.slice(0, 3)).join(' / ')} ·{' '}
                  {formatTime12(event.start)} to {formatTime12(event.end)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3 className="serif">Flex Tasks</h3>
            <span className="badge mono">{flexTasks.length}</span>
          </div>
          <FlexTaskForm
            onAdd={(task) => onFlexTasksChange([...flexTasks, task])}
          />
          <div className="cards-grid">
            {flexTasks.length === 0 && (
              <p className="empty">
                Studying, gym, errands. Anything that can move.
              </p>
            )}
            {flexTasks.map((task) => (
              <article
                key={task.id}
                className={`card flex-card priority-${task.priority}`}
              >
                <div className="card-row">
                  <strong>{task.name}</strong>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => removeFlex(task.id)}
                  >
                    Remove
                  </button>
                </div>
                <p className="muted">
                  {task.duration}m · {task.energy} · P{task.priority} ·{' '}
                  {task.occurrences}x/wk
                  {task.deadline ? ` · by ${formatHumanDate(task.deadline)}` : ''}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="panel build-panel">
        <div className="build-panel-row">
          <div>
            <h3 className="serif">Ready when you are</h3>
            <p className="muted">
              {canBuild
                ? 'We will produce three weekly schedules with different burnout outlooks.'
                : 'Add at least one task to build your week.'}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-dark btn-large"
            onClick={onBuildWeek}
            disabled={!canBuild}
            aria-disabled={!canBuild}
          >
            Build My Week
          </button>
        </div>
      </section>
    </div>
  )
}
