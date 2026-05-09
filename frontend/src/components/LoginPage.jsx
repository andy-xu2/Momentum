import { useState } from 'react'
import BrandMark from './BrandMark.jsx'
import { api } from '../api.js'

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim()) { setError('Enter your email.'); return }
    if (!password) { setError('Enter a password.'); return }
    if (mode === 'register' && !name.trim()) { setError('Enter your name.'); return }

    setSubmitting(true)
    try {
      const payload = mode === 'register'
        ? { email: email.trim(), password, name: name.trim() }
        : { email: email.trim(), password }
      const user = mode === 'register' ? await api.register(payload) : await api.login(payload)
      onLogin(user)
    } catch (err) {
      const raw = err.message.replace(/^API \d+: /, '')
      try {
        setError(JSON.parse(raw).detail ?? raw)
      } catch {
        setError(raw)
      }
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode(next) {
    setMode(next)
    setError('')
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <BrandMark size="lg" />
      </header>

      <div className="login-grid">
        <section className="login-hero">
          <h1 className="serif">
            A calendar that <em>optimizes</em> your week.
          </h1>
        </section>

        <section className="login-card">
          <div className="login-card-body">
            <p className="muted small">{mode === 'login' ? 'Welcome back' : 'Get started'}</p>
            <h2 className="serif">
              {mode === 'login' ? 'Sign in to Momentum' : 'Create your account'}
            </h2>

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === 'register' && (
                <label className="auth-field">
                  <span>Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </label>
              )}

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
                  {mode === 'login' && (
                    <button type="button" className="auth-link">Forgot?</button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
              </label>

              {error && <p className="form-error">{error}</p>}

              <button
                type="submit"
                className="btn btn-dark btn-large"
                disabled={submitting}
              >
                {submitting
                  ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                  : (mode === 'login' ? 'Sign in →' : 'Create account →')}
              </button>
            </form>

            <p className="auth-footer">
              {mode === 'login' ? (
                <>New here?{' '}
                  <button type="button" className="auth-link strong" onClick={() => switchMode('register')}>
                    Create an account
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button type="button" className="auth-link strong" onClick={() => switchMode('login')}>
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
