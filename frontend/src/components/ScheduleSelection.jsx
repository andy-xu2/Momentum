import BurnoutLegend from './BurnoutLegend.jsx'
import ScheduleCard from './ScheduleCard.jsx'

export default function ScheduleSelection({
  options,
  wakeTime,
  sleepTime,
  onSelect,
  onBack,
}) {
  return (
    <div className="selection-page">
      <div className="page-header">
        <div>
          <h2 className="serif">
            Pick a <em>schedule</em>.
          </h2>
          <p className="muted">
            Three weeks tuned for different energy patterns. Hover any card
            for a detailed preview before you commit.
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Back to Add Tasks
        </button>
      </div>
      <BurnoutLegend />
      <div className="schedule-grid">
        {options.map((option) => (
          <ScheduleCard
            key={option.id}
            option={option}
            wakeTime={wakeTime}
            sleepTime={sleepTime}
            onSelect={() => onSelect(option)}
          />
        ))}
      </div>
    </div>
  )
}
