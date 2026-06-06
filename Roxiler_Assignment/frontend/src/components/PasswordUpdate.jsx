import { useState } from 'react'
import api from '../services/api'

function isValidPassword(value) {
  return value.length >= 8 && value.length <= 16 && /[A-Z]/.test(value) && /[!@#$%^&*(),.?":{}|<>]/.test(value)
}

export default function PasswordUpdate() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '' })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  const onChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setMessage({ type: '', text: '' })

    if (!isValidPassword(form.newPassword)) {
      setMessage({
        type: 'error',
        text: 'New password must be 8-16 characters with at least one uppercase letter and one special character.'
      })
      return
    }

    setLoading(true)
    try {
      const response = await api.put('/auth/update-password', form)
      setMessage({ type: 'success', text: response.data.message || 'Password updated successfully.' })
      setForm({ oldPassword: '', newPassword: '' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to update password.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel" style={{ textAlign: 'left', maxWidth: '600px' }}>
      <h3>Update Account Password</h3>
      
      {message.text && (
        <div className={`alert-box ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            {message.type === 'error' ? (
              <>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </>
            ) : (
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            )}
          </svg>
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="oldPassword">Current Password</label>
          <input
            id="oldPassword"
            name="oldPassword"
            type="password"
            value={form.oldPassword}
            onChange={onChange}
            className="form-input"
            placeholder="••••••••"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={onChange}
            className="form-input"
            placeholder="••••••••"
            required
          />
          <div className="form-helper-text">
            Must be 8-16 characters long and include an uppercase letter and a special character.
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  )
}
