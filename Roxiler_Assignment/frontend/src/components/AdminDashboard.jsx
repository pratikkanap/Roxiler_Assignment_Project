import React, { useState, useEffect } from 'react'
import API from '../services/api'

const StatCard = ({ title, value, type }) => {
  const getIcon = () => {
    if (type === 'users') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    }
    if (type === 'stores') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      )
    }
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    )
  }

  const getThemeClass = () => {
    if (type === 'users') return 'stat-card stat-card-purple'
    if (type === 'stores') return 'stat-card stat-card-blue'
    return 'stat-card stat-card-amber'
  }

  return (
    <div className={getThemeClass()}>
      <div className="stat-icon-wrapper">
        {getIcon()}
      </div>
      <div className="stat-card-content">
        <span className="stat-label">{title}</span>
        <strong className="stat-value">{value}</strong>
      </div>
    </div>
  )
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 })
  const [users, setUsers] = useState([])
  const [stores, setStores] = useState([])
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'provisioning'

  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('')
  const [userSort, setUserSort] = useState({ field: 'name', order: 'asc' })

  const [storeSearch, setStoreSearch] = useState('')
  const [storeSort, setStoreSort] = useState({ field: 'name', order: 'asc' })

  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', address: '', role: 'User' })
  const [storeForm, setStoreForm] = useState({ name: '', email: '', address: '', ownerId: '' })
  const [formMsg, setFormMsg] = useState({ type: '', text: '' })

  const fetchMetrics = async () => {
    try {
      const res = await API.get('/admin/dashboard')
      setStats(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await API.get(`/admin/users?search=${encodeURIComponent(userSearch)}&role=${encodeURIComponent(userRoleFilter)}&sortBy=${userSort.field}&order=${userSort.order}`)
      setUsers(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchStores = async () => {
    try {
      const res = await API.get(`/admin/stores?search=${encodeURIComponent(storeSearch)}&sortBy=${storeSort.field}&order=${storeSort.order}`)
      setStores(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { fetchMetrics() }, [])
  useEffect(() => { fetchUsers() }, [userSearch, userRoleFilter, userSort])
  useEffect(() => { fetchStores() }, [storeSearch, storeSort])

  const handleUserFormChange = (e) => setUserForm({ ...userForm, [e.target.name]: e.target.value })
  const handleStoreFormChange = (e) => setStoreForm({ ...storeForm, [e.target.name]: e.target.value })

  const validatePassword = (p) => {
    if (!p) return false
    if (p.length < 8 || p.length > 16) return false
    if (!/[A-Z]/.test(p)) return false
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(p)) return false
    return true
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setFormMsg({ type: '', text: '' })

    if (userForm.name.trim().length < 20 || userForm.name.trim().length > 60) {
      return setFormMsg({ type: 'error', text: 'Name must be 20-60 characters.' })
    }
    if (!userForm.address.trim() || userForm.address.length > 400) {
      return setFormMsg({ type: 'error', text: 'Address is required and must be at most 400 characters.' })
    }
    if (!validatePassword(userForm.password)) {
      return setFormMsg({ type: 'error', text: 'Password must be 8-16 chars, include an uppercase and a special character.' })
    }

    try {
      await API.post('/admin/users', userForm)
      setFormMsg({ type: 'success', text: 'User account provisioned successfully!' })
      setUserForm({ name: '', email: '', password: '', address: '', role: 'User' })
      fetchUsers()
      fetchMetrics()
    } catch (err) {
      setFormMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create user.' })
    }
  }

  const handleCreateStore = async (e) => {
    e.preventDefault()
    setFormMsg({ type: '', text: '' })

    if (!storeForm.name.trim() || storeForm.name.length > 60) {
      return setFormMsg({ type: 'error', text: 'Store name is required and must be at most 60 characters.' })
    }
    if (!storeForm.address.trim() || storeForm.address.length > 400) {
      return setFormMsg({ type: 'error', text: 'Store address is required and must be at most 400 characters.' })
    }

    try {
      await API.post('/admin/stores', storeForm)
      setFormMsg({ type: 'success', text: 'Store asset configured successfully!' })
      setStoreForm({ name: '', email: '', address: '', ownerId: '' })
      fetchStores()
      fetchMetrics()
    } catch (err) {
      setFormMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create store.' })
    }
  }

  const toggleUserSort = (field) => {
    const isAsc = userSort.field === field && userSort.order === 'asc'
    setUserSort({ field, order: isAsc ? 'desc' : 'asc' })
  }

  const toggleStoreSort = (field) => {
    const isAsc = storeSort.field === field && storeSort.order === 'asc'
    setStoreSort({ field, order: isAsc ? 'desc' : 'asc' })
  }

  const getRoleBadgeClass = (role) => {
    if (role === 'Admin') return 'badge badge-admin'
    if (role === 'StoreOwner') return 'badge badge-owner'
    return 'badge badge-user'
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <h3 style={{ fontSize: '1.65rem', marginBottom: '1.25rem' }}>System Overview</h3>

      {/* 1. DASHBOARD OVERVIEW COUNTS */}
      <div className="stats-grid">
        <StatCard title="Total Registered Users" value={stats.totalUsers} type="users" />
        <StatCard title="Total Stores Tracked" value={stats.totalStores} type="stores" />
        <StatCard title="Total Ratings Submitted" value={stats.totalRatings} type="ratings" />
      </div>

      {formMsg.text && (
        <div className={`alert-box ${formMsg.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            {formMsg.type === 'error' ? (
              <>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </>
            ) : (
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            )}
          </svg>
          <span>{formMsg.text}</span>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="tabs-header">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => { setActiveTab('overview'); setFormMsg({ type: '', text: '' }) }}
        >
          Registries Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'provisioning' ? 'active' : ''}`}
          onClick={() => { setActiveTab('provisioning'); setFormMsg({ type: '', text: '' }) }}
        >
          System Provisioning
        </button>
      </div>

      {/* 2. CREATION MODULE (TAB: PROVISIONING) */}
      {activeTab === 'provisioning' && (
        <div className="dashboard-grid-2">
          <div className="panel">
            <h3>Add New User Account</h3>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  name="name"
                  value={userForm.name}
                  onChange={handleUserFormChange}
                  className="form-input"
                  placeholder="20-60 characters"
                  required
                />
                <div className="form-helper-text">
                  Must be between 20 and 60 characters. Current: {userForm.name.trim().length}
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  name="email"
                  value={userForm.email}
                  onChange={handleUserFormChange}
                  type="email"
                  className="form-input"
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Physical Address</label>
                <textarea
                  name="address"
                  value={userForm.address}
                  onChange={handleUserFormChange}
                  className="form-textarea"
                  placeholder="Physical street address"
                  required
                />
                <div className="form-helper-text">
                  Max 400 characters. Current: {userForm.address.length}
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  name="password"
                  value={userForm.password}
                  onChange={handleUserFormChange}
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  required
                />
                <div className="form-helper-text">
                  8-16 characters, 1 uppercase letter, 1 special character
                </div>
              </div>
              <div className="form-group">
                <label>System Role</label>
                <select name="role" value={userForm.role} onChange={handleUserFormChange} className="form-select">
                  <option value="User">Normal User</option>
                  <option value="StoreOwner">Store Owner</option>
                  <option value="Admin">System Administrator</option>
                </select>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary btn-full">Provision User Account</button>
              </div>
            </form>
          </div>

          <div className="panel">
            <h3>Register New Store Location</h3>
            <form onSubmit={handleCreateStore}>
              <div className="form-group">
                <label>Store Name</label>
                <input
                  name="name"
                  value={storeForm.name}
                  onChange={handleStoreFormChange}
                  className="form-input"
                  placeholder="e.g. Central Market Plaza"
                  required
                />
              </div>
              <div className="form-group">
                <label>Official Email</label>
                <input
                  name="email"
                  value={storeForm.email}
                  onChange={handleStoreFormChange}
                  type="email"
                  className="form-input"
                  placeholder="store@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Store Address</label>
                <textarea
                  name="address"
                  value={storeForm.address}
                  onChange={handleStoreFormChange}
                  className="form-textarea"
                  placeholder="Store location address"
                  required
                />
              </div>
              <div className="form-group">
                <label>Owner ID (Optional)</label>
                <input
                  name="ownerId"
                  value={storeForm.ownerId}
                  onChange={handleStoreFormChange}
                  className="form-input"
                  placeholder="UUID format if assigning owner"
                />
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary btn-full">Configure Store Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. FILTERABLE / SORTABLE MASTER DATA GRIDS (TAB: OVERVIEW) */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* User Registry Section */}
          <div className="panel">
            <div className="panel-header-row">
              <h3>Global Users Registry</h3>
              <div className="header-actions">
                <div className="search-wrapper">
                  <svg className="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="form-input search-input"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="form-select"
                  style={{ width: '150px', padding: '0.55rem 1rem' }}
                >
                  <option value="">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                  <option value="StoreOwner">Store Owner</option>
                </select>
                {(userSearch || userRoleFilter) && (
                  <button onClick={() => { setUserSearch(''); setUserRoleFilter('') }} className="btn btn-secondary" style={{ padding: '0.55rem 1rem' }}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => toggleUserSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Name {userSort.field === 'name' ? (userSort.order === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th onClick={() => toggleUserSort('email')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Email {userSort.field === 'email' ? (userSort.order === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th onClick={() => toggleUserSort('address')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Address {userSort.field === 'address' ? (userSort.order === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th>Role</th>
                    <th>Store Owner Rating Metric</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.address}</td>
                      <td>
                        <span className={getRoleBadgeClass(u.role)}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {u.role === 'StoreOwner' ? (
                          <span className="badge badge-rating">
                            ★ {parseFloat(u.rating || u.overallRating || 0).toFixed(1)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No user records found matching search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Store Registry Section */}
          <div className="panel">
            <div className="panel-header-row">
              <h3>Global Stores Registry</h3>
              <div className="header-actions">
                <div className="search-wrapper">
                  <svg className="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    placeholder="Search stores..."
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                    className="form-input search-input"
                  />
                </div>
                {storeSearch && (
                  <button onClick={() => setStoreSearch('')} className="btn btn-secondary" style={{ padding: '0.55rem 1rem' }}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => toggleStoreSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Store Name {storeSort.field === 'name' ? (storeSort.order === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th onClick={() => toggleStoreSort('email')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Email {storeSort.field === 'email' ? (storeSort.order === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th onClick={() => toggleStoreSort('address')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Address {storeSort.field === 'address' ? (storeSort.order === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th>Overall Rating Aggregate</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.address}</td>
                      <td>
                        <span className="badge badge-rating" style={{ fontSize: '0.9rem' }}>
                          ★ {parseFloat(s.overallRating || s.rating || 0).toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stores.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No stores found matching search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

export default AdminDashboard
