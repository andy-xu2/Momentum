import { useState } from 'react'
import BrandMark from './BrandMark.jsx'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('kimber@umd.edu')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!email.trim()) {
      setError('Enter your school email.')
      return
    }
    if (!password) {
      setError('Enter a password.')
      return
    }
    setError('')
    setSubmitting(true)
    // Frontend-only auth for the demo. Wire to a real /auth endpoint later.
    setTimeout(() => {
      onLogin({
        email: email.trim(),
        name: deriveName(email.trim()),
        school: deriveSchool(email.trim()),
      })
      setSubmitting(false)
    }, 250)
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <BrandMark size="lg" />
      </header>

      <div className="login-grid">
        <section className="login-hero">
          <h1 className="serif">
            A calendar that <em>protects</em> your week, not just fills it.
          </h1>
        </section>

        <section className="login-card">
          <div className="login-card-body">
            <p className="muted small">Welcome back</p>
            <h2 className="serif">Sign in to Momentum</h2>

            <form onSubmit={handleSubmit} className="auth-form">
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  autoComplete="email"
                />
              </label>
              <label className="auth-field">
                <div className="auth-field-row">
                  <span>Password</span>
                  <button type="button" className="auth-link">
                    Forgot?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </label>

              {error && <p className="form-error">{error}</p>}

              <button
                type="submit"
                className="btn btn-dark btn-large"
                disabled={submitting}
              >
                {submitting ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>

            <p className="auth-footer">
              New here?{' '}
              <button type="button" className="auth-link strong">
                Create an account
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function deriveName(email) {
  const local = email.split('@')[0] || 'Student'
  return local
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

function deriveSchool(email) {
  const domain = (email.split('@')[1] || '').toLowerCase()
  if (domain.includes('umd')) return "UMD · CS '27"
  if (domain.includes('illinois')) return "UIUC · CS '27"
  if (domain.includes('berkeley')) return "Cal · CS '27"
  if (domain.includes('mit')) return "MIT · CS '27"
  return "CS '27"
}
