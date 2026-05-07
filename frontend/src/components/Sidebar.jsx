import BrandMark from './BrandMark.jsx'
import CategoryList from './CategoryList.jsx'
import MiniCalendar from './MiniCalendar.jsx'
import StreaksPanel from './StreaksPanel.jsx'
import { todayIso } from '../constants.js'

export default function Sidebar({ user, streaks, anchorIso }) {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <BrandMark size="md" />
      </div>
      <MiniCalendar todayIso={todayIso()} anchorIso={anchorIso} />
      <CategoryList />
      <StreaksPanel streaks={streaks} />

      <div className="sidebar-spacer" />

      {user && (
        <div className="user-card">
          <div className="user-avatar" aria-hidden>
            {(user.name || 'You').slice(0, 1)}
          </div>
          <div className="user-meta">
            <strong>{user.name}</strong>
            <span>{user.school}</span>
          </div>
        </div>
      )}
    </aside>
  )
}
