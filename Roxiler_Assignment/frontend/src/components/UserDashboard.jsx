import { useEffect, useState } from 'react'
import api from '../services/api'

const InteractiveStars = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="rating-interactive-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-interactive ${(hovered >= star || (!hovered && value >= star)) ? 'active' : ''}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          title={`Rate ${star} Stars`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function UserDashboard() {
  const [stores, setStores] = useState([])
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const fetchStores = async () => {
    try {
      const response = await api.get(`/core/stores?search=${encodeURIComponent(search)}`)
      setStores(response.data || [])
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to load stores.' })
    }
  }

  useEffect(() => {
    fetchStores()
  }, [search])

  const submitRating = async (storeId, rating) => {
    setMessage({ type: '', text: '' })
    try {
      await api.post('/core/rate', { storeId, rating: Number(rating) })
      setMessage({ type: 'success', text: 'Thank you! Your rating has been submitted successfully.' })
      fetchStores()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to save rating.' })
    }
  }

  return (
    <div className="panel" style={{ textAlign: 'left' }}>
      <div className="panel-header-row">
        <h3>Registered Stores</h3>
        <div className="header-actions">
          <div className="search-wrapper" style={{ maxWidth: '360px' }}>
            <svg className="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search store name or address..."
              className="form-input search-input"
            />
          </div>
          {search && (
            <button onClick={() => setSearch('')} className="btn btn-secondary" style={{ padding: '0.55rem 1rem' }}>
              Clear
            </button>
          )}
        </div>
      </div>

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

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Store Name</th>
              <th>Address</th>
              <th>Overall rating</th>
              <th>Your submitted rating</th>
              <th style={{ width: '180px' }}>Rate this Store</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id}>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{store.name}</td>
                <td>{store.address}</td>
                <td>
                  <span className="badge badge-rating">
                    ★ {parseFloat(store.overallRating || 0).toFixed(1)}
                  </span>
                </td>
                <td>
                  {store.userSubmittedRating ? (
                    <span className="badge badge-rating" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--accent)' }}>
                      ★ {store.userSubmittedRating}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not rated yet</span>
                  )}
                </td>
                <td>
                  <InteractiveStars
                    value={store.userSubmittedRating || 0}
                    onChange={(rating) => submitRating(store.id, rating)}
                  />
                </td>
              </tr>
            ))}
            {stores.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No stores found. Try searching for a different keyword.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
