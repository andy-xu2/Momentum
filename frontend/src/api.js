const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json()
}

export const api = {
  generateSchedules: (payload) =>
    request('/schedules/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  rescheduleMissed: (payload) =>
    request('/schedules/reschedule', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
