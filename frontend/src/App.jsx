import { useEffect, useMemo, useState } from 'react'
import BrandMark from './components/BrandMark.jsx'
import Dashboard from './components/Dashboard.jsx'
import InputPage from './components/InputPage.jsx'
import LoginPage from './components/LoginPage.jsx'
import ScheduleSelection from './components/ScheduleSelection.jsx'
import ToastNotification from './components/ToastNotification.jsx'
import { api } from './api.js'
import {
  CATEGORY_COLORS,
  categoryForItem,
  loadAuth,
  loadStreaks,
  saveAuth,
  saveStreaks,
  streakGoal,
  todayIso,
  weekMondayIso,
} from './constants.js'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'selection', label: 'Schedules' },
  { id: 'input', label: 'Add Tasks' },
]

export default function App() {
  const [user, setUser] = useState(() => loadAuth())
  const [screen, setScreen] = useState('input')
  const [wakeTime, setWakeTime] = useState('07:30')
  const [sleepTime, setSleepTime] = useState('23:30')
  const [fixedEvents, setFixedEvents] = useState([])
  const [flexTasks, setFlexTasks] = useState([])
  const [scheduleOptions, setScheduleOptions] = useState([])
  const [activeSchedule, setActiveSchedule] = useState(null)
  const [scheduleAnchor, setScheduleAnchor] = useState(null)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [streaks, setStreaks] = useState(() => loadStreaks())

  useEffect(() => {
    saveStreaks(streaks)
  }, [streaks])

  function showToast(message) {
    setToast({ id: crypto.randomUUID(), message })
    setTimeout(() => setToast(null), 4000)
  }

  function handleLogin(profile) {
    setUser(profile)
    saveAuth(profile)
    setScreen(activeSchedule ? 'dashboard' : 'input')
  }

  function handleLogout() {
    saveAuth(null)
    setUser(null)
  }

  async function handleBuildWeek() {
    if (flexTasks.length === 0) {
      showToast('Add at least one task to build your week.')
      return
    }
    try {
      setLoading(true)
      const today = scheduleAnchor || weekMondayIso()
      setScheduleAnchor(today)
      const payload = {
        wake_time: wakeTime,
        sleep_time: sleepTime,
        fixed_events: fixedEvents,
        flex_tasks: flexTasks,
        today,
      }
      const data = await api.generateSchedules(payload)
      setScheduleOptions(data.options)
      setScreen('selection')
    } catch (err) {
      setError(err.message)
      showToast('Could not reach the scheduling engine.')
    } finally {
      setLoading(false)
    }
  }

  function handleSelectSchedule(option) {
    const withStatus = {
      ...option,
      placements: option.placements.map((p) => ({ ...p })),
    }
    setActiveSchedule(withStatus)
    setScreen('dashboard')
  }

  function bumpStreak(name, delta, occurrences) {
    if (!name) return
    setStreaks((prev) => {
      const existing = prev[name]
      const goal = existing?.goal ?? streakGoal(occurrences || 1)
      const color = existing?.color ?? '#8a6df0'
      const current = Math.max(0, (existing?.current ?? 0) + delta)
      return {
        ...prev,
        [name]: { name, current, goal, color },
      }
    })
  }

  function handleMarkDone(placementId) {
    if (!activeSchedule) return
    const target = activeSchedule.placements.find((p) => p.id === placementId)
    if (!target) return
    setActiveSchedule({
      ...activeSchedule,
      placements: activeSchedule.placements.map((p) =>
        p.id === placementId ? { ...p, status: 'done' } : p,
      ),
    })
    const sourceTask = flexTasks.find((t) => t.id === target.source_id)
    setStreaks((prev) => {
      const existing = prev[target.name]
      const goal = existing?.goal ?? streakGoal(sourceTask?.occurrences || 1)
      const color = categoryForItem(target).bar
      const current = (existing?.current ?? 0) + 1
      return {
        ...prev,
        [target.name]: { name: target.name, current, goal, color },
      }
    })
  }

  async function handleMarkMissed(placementId) {
    if (!activeSchedule) return
    const target = activeSchedule.placements.find((p) => p.id === placementId)
    if (!target) return
    try {
      const data = await api.rescheduleMissed({
        schedule: activeSchedule,
        placement_id: placementId,
      })
      setActiveSchedule(data.schedule)
      showToast(data.message)
      bumpStreak(target.name, -1)
    } catch (err) {
      setError(err.message)
      showToast('Could not reschedule that task.')
    }
  }

  function handleNavClick(target) {
    if (target === 'dashboard' && !activeSchedule) return
    if (target === 'selection' && scheduleOptions.length === 0) return
    setScreen(target)
  }

  const navState = useMemo(
    () => ({
      dashboard: !!activeSchedule,
      selection: scheduleOptions.length > 0,
      input: true,
    }),
    [activeSchedule, scheduleOptions.length],
  )

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <header className="app-header">
        <BrandMark size="md" />
        <nav className="app-nav">
          {NAV_ITEMS.map((item) => {
            const enabled = navState[item.id]
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-pill ${screen === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                disabled={!enabled}
              >
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="header-spacer">
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            {error}{' '}
            <button type="button" onClick={() => setError(null)}>
              dismiss
            </button>
          </div>
        )}

        {screen === 'input' && (
          <InputPage
            wakeTime={wakeTime}
            sleepTime={sleepTime}
            fixedEvents={fixedEvents}
            flexTasks={flexTasks}
            loading={loading}
            onWakeTimeChange={setWakeTime}
            onSleepTimeChange={setSleepTime}
            onFixedEventsChange={setFixedEvents}
            onFlexTasksChange={setFlexTasks}
            onBuildWeek={handleBuildWeek}
          />
        )}

        {screen === 'selection' && (
          <ScheduleSelection
            options={scheduleOptions}
            wakeTime={wakeTime}
            sleepTime={sleepTime}
            onSelect={handleSelectSchedule}
            onBack={() => setScreen('input')}
          />
        )}

        {screen === 'dashboard' && activeSchedule && (
          <Dashboard
            schedule={activeSchedule}
            onMarkMissed={handleMarkMissed}
            onMarkDone={handleMarkDone}
            onBack={() => setScreen('selection')}
          />
        )}
      </main>

      {toast && <ToastNotification key={toast.id} message={toast.message} />}
    </div>
  )
}

// Re-export for legacy imports.
export { CATEGORY_COLORS }
