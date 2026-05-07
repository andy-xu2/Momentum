export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export const ENERGY_LEVELS = ['Low', 'Medium', 'High']

export const BURNOUT_THRESHOLDS = {
  yellow: 40,
  red: 70,
}

export const BURNOUT_BANDS = [
  { color: 'Green', label: 'Sustainable', hex: '#3a9c6b' },
  { color: 'Yellow', label: 'Moderate load', hex: '#c79b1e' },
  { color: 'Red', label: 'High burnout risk', hex: '#d65a5a' },
]

export const BURNOUT_COLOR_HEX = {
  Green: '#3a9c6b',
  Yellow: '#c79b1e',
  Red: '#d65a5a',
}

export function burnoutColorForScore(score) {
  if (score < BURNOUT_THRESHOLDS.yellow) return 'Green'
  if (score < BURNOUT_THRESHOLDS.red) return 'Yellow'
  return 'Red'
}

// Category palette mirrors the visual reference (Momentum-frontend-demo).
// Each entry has a soft fill, a saturated accent (used for the side bar
// and the category dot), and an ink color that stays readable on the fill.
export const CATEGORY_COLORS = {
  class: { fill: '#e7e0ff', bar: '#8a6df0', ink: '#4731a8', label: 'Classes' },
  study: { fill: '#ffe4d6', bar: '#e87a3c', ink: '#8a3f10', label: 'Study' },
  health: { fill: '#d8efe2', bar: '#3a9c6b', ink: '#16573a', label: 'Health' },
  social: { fill: '#ffe2ee', bar: '#d65a8e', ink: '#7a1f48', label: 'Social' },
  rest: { fill: '#e6e9f5', bar: '#6a78b8', ink: '#2c3766', label: 'Rest' },
  personal: { fill: '#fff3c4', bar: '#c79b1e', ink: '#6e530a', label: 'Personal' },
}

// Map a placement to a visual category. Fixed events are styled like
// classes (purple). Flex tasks are mapped from priority and energy so
// the calendar looks varied without users picking categories themselves.
export function categoryForItem(item) {
  if (!item) return CATEGORY_COLORS.personal
  if (item.kind === 'fixed') return CATEGORY_COLORS.class
  const energy = item.energy || 'Medium'
  if (energy === 'High') {
    return item.priority >= 4 ? CATEGORY_COLORS.study : CATEGORY_COLORS.social
  }
  if (energy === 'Low') {
    return item.priority <= 2 ? CATEGORY_COLORS.rest : CATEGORY_COLORS.personal
  }
  return item.priority >= 4 ? CATEGORY_COLORS.social : CATEGORY_COLORS.health
}

export function timeToMin(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function minToTime(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function formatTime12(hhmm) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${display}:${String(m).padStart(2, '0')} ${period}`
}

// Compact "8a" / "3:30p" style used in calendar chips.
export function formatTimeChip(hhmm) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const period = h < 12 ? 'a' : 'p'
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h
  if (m === 0) return `${display}${period}`
  return `${display}:${String(m).padStart(2, '0')}${period}`
}

export function formatHour12(hour) {
  const period = hour < 12 ? 'a' : 'p'
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${display}${period}`
}

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const DOW_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export { MONTH_LABELS, DOW_SHORT }

export function todayIso() {
  const today = new Date()
  return isoFromDate(today)
}

export function isoFromDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function dateFromIso(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function weekMondayIso(reference = new Date()) {
  const ref = new Date(reference)
  const dow = (ref.getDay() + 6) % 7
  ref.setDate(ref.getDate() - dow)
  return isoFromDate(ref)
}

export function monthLabel(date) {
  return `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`
}

export function shortMonthLabel(date) {
  return MONTH_LABELS[date.getMonth()].slice(0, 3)
}

export function formatHumanDate(iso) {
  if (!iso) return ''
  const date = dateFromIso(iso)
  return `${MONTH_LABELS[date.getMonth()].slice(0, 3)} ${date.getDate()}`
}

export function dayNameFromDate(input) {
  const date = typeof input === 'string' ? dateFromIso(input) : input
  return DAYS[(date.getDay() + 6) % 7]
}

// Streak tracking. Streaks only update from real Done/Missed actions,
// so the UI never shows fake values.
const STREAK_KEY = 'momentum.streaks'

export function streakGoal(occurrences = 1) {
  if (occurrences >= 5) return 21
  if (occurrences >= 3) return 14
  return 7
}

export function loadStreaks() {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function saveStreaks(streaks) {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streaks))
  } catch {
    // ignore quota errors
  }
}

const AUTH_KEY = 'momentum.auth'

export function loadAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveAuth(user) {
  try {
    if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    else localStorage.removeItem(AUTH_KEY)
  } catch {
    // ignore
  }
}

// Build a 6×7 month grid keyed by ISO dates so the mini-calendar can
// render past, current, and next month cells in one pass.
export function monthGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1)
  const startDow = first.getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const daysPrev = new Date(year, monthIndex, 0).getDate()
  const cells = []
  for (let i = startDow - 1; i >= 0; i--) {
    const d = daysPrev - i
    const m = monthIndex === 0 ? 11 : monthIndex - 1
    const y = monthIndex === 0 ? year - 1 : year
    cells.push({ y, m, d, inMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ y: year, m: monthIndex, d, inMonth: true })
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1]
    const dt = new Date(last.y, last.m, last.d)
    dt.setDate(dt.getDate() + 1)
    cells.push({
      y: dt.getFullYear(),
      m: dt.getMonth(),
      d: dt.getDate(),
      inMonth: dt.getMonth() === monthIndex,
    })
  }
  return cells
}
