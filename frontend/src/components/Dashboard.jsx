import BurnoutDial from './BurnoutDial.jsx'
import BurnoutLegend from './BurnoutLegend.jsx'
import TaskSidebar from './TaskSidebar.jsx'
import WeekView from './WeekView.jsx'
import { formatTime12 } from '../constants.js'

export default function Dashboard({
  schedule,
  onMarkMissed,
  onMarkDone,
  onBack,
}) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-toolbar">
        <div>
          <h2 className="serif">
            Your week. <em>Optimized.</em>
          </h2>
          <p className="muted mono small">
            {formatTime12(schedule.wake_time)} – {formatTime12(schedule.sleep_time)}
          </p>
        </div>
        <div className="dashboard-toolbar-right">
          <BurnoutDial score={schedule.burnout_score} />
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            Pick a different schedule
          </button>
        </div>
      </div>

      {schedule.warnings && schedule.warnings.length > 0 && (
        <div className="warning-banner">
          {schedule.warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}

      <div className="dashboard-legends">
        <BurnoutLegend compact />
      </div>

      <div className="dashboard-body">
        <WeekView
          schedule={schedule}
          onMarkMissed={onMarkMissed}
          onMarkDone={onMarkDone}
        />
        <TaskSidebar
          schedule={schedule}
          onMarkMissed={onMarkMissed}
          onMarkDone={onMarkDone}
        />
      </div>
    </div>
  )
}
