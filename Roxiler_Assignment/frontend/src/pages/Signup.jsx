import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

function validatePassword(p) {
  if (!p) return false
  if (p.length < 8 || p.length > 16) return false
  if (!/[A-Z]/.test(p)) return false
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(p)) return false
  return true
}

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const nameTrimmed = form.name.trim()
    if (nameTrimmed.length < 20 || nameTrimmed.length > 60) {
      setError('Name must be between 20 and 60 characters.')
      return
    }
    if (!form.address.trim() || form.address.length > 400) {
      setError('Address is required and cannot exceed 400 characters.')
      return
    }
    if (!validatePassword(form.password)) {
      setError('Password must be 8-16 characters long and include at least one uppercase letter and one special character.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/signup', form)
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 540 }}>
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Register as a new user to start rating and tracking store performance</p>
        </div>

        {error && (
          <div className="alert-box alert-danger">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              placeholder="e.g. Aditya Vardhan Sharma"
              value={form.name}
              onChange={onChange}
              className="form-input"
              required
            />
            <div className="form-helper-text">
              Must be 20 to 60 characters. Current length: {form.name.trim().length}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              placeholder="e.g. aditya@example.com"
              value={form.email}
              onChange={onChange}
              type="email"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Physical Address</label>
            <textarea
              id="address"
              name="address"
              placeholder="e.g. 123 Main St, New Delhi, India"
              value={form.address}
              onChange={onChange}
              className="form-textarea"
              required
            />
            <div className="form-helper-text">
              Maximum 400 characters. Current length: {form.address.length}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              type="password"
              className="form-input"
              required
            />
            <div className="form-helper-text">
              Must be 8-16 characters with an uppercase letter and a special character.
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ fontWeight: 600 }}>Log in here</Link>
        </div>
      </div>
    </div>
  )
}
