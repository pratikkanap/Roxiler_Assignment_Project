import { useEffect, useState } from 'react'
import api from '../services/api'

export default function OwnerDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get('/core/owner-dashboard')
        setDashboard(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load owner dashboard.')
      }
    }
    loadDashboard()
  }, [])

  // Generate initials for reviewer avatar
  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }

  if (error) {
    return (
      <section className="panel" style={{ textAlign: 'left' }}>
        <div className="alert-box alert-danger">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      </section>
    )
  }

  if (!dashboard) {
    return (
      <section className="panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading owner dashboard analytics...</div>
      </section>
    )
  }

  return (
    <section className="panel" style={{ textAlign: 'left' }}>
      <div className="owner-metric-header">
        <div className="owner-store-info">
          <h2 style={{ fontSize: '1.85rem', color: 'var(--text-primary)' }}>{dashboard.storeName}</h2>
          <p className="muted-text" style={{ fontSize: '1rem', marginTop: '4px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {dashboard.storeAddress}
          </p>
        </div>
        
        <div className="owner-metrics-container">
          <div className="owner-metric-box">
            <span className="owner-metric-title">Average Rating</span>
            <div className="owner-metric-value star-text-row">
              <span style={{ color: '#fbbf24' }}>★</span>
              <span>{parseFloat(dashboard.averageRating || 0).toFixed(1)}</span>
            </div>
          </div>
          <div className="owner-metric-box" style={{ borderLeft: '3px solid var(--accent)' }}>
            <span className="owner-metric-title">Total Ratings</span>
            <div className="owner-metric-value" style={{ color: 'var(--text-primary)' }}>
              {dashboard.totalRatingsCount}
            </div>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Customer Ratings Feed</h3>
      
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Address</th>
              <th style={{ width: '120px' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.ratingsReceived.map((item) => (
              <tr key={`${item.User.id}-${item.createdAt}`}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignPositions: 'center', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-muted)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifycontent: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border-color)'
                    }}>
                      {getInitials(item.User.name)}
                    </div>
                    <span>{item.User.name}</span>
                  </div>
                </td>
                <td>{item.User.email}</td>
                <td>{item.User.address}</td>
                <td>
                  <span className="badge badge-rating">
                    ★ {item.rating}
                  </span>
                </td>
              </tr>
            ))}
            {dashboard.ratingsReceived.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No ratings submitted yet for your store.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
