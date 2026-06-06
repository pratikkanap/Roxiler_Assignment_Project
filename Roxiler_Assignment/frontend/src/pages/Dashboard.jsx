import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminDashboard from '../components/AdminDashboard'
import UserDashboard from '../components/UserDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import PasswordUpdate from '../components/PasswordUpdate'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const s = localStorage.getItem('user')
    if (!s) return navigate('/login')
    setUser(JSON.parse(s))
  }, [navigate])

  if (!user) return null

  // Generate initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  // Get nice role badge class
  const getRoleBadgeClass = (role) => {
    if (role === 'Admin') return 'badge badge-admin'
    if (role === 'StoreOwner') return 'badge badge-owner'
    return 'badge badge-user'
  }

  const getRoleLabel = (role) => {
    if (role === 'Admin') return 'Administrator'
    if (role === 'StoreOwner') return 'Store Owner'
    return 'User'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <header className="topbar">
        <div className="topbar-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <h2>Stora</h2>
        </div>
        
        <div className="topbar-user">
          <div className="user-profile-info">
            <div className="avatar-circle">
              {getInitials(user.name)}
            </div>
            <div className="user-meta">
              <span className="user-name">{user.name}</span>
              <div>
                <span className={getRoleBadgeClass(user.role)}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>
          </div>
          
          <button onClick={handleLogout} className="btn btn-logout">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Log out
          </button>
        </div>
      </header>

      <main className="dashboard-shell" style={{ flex: 1 }}>
        {user.role === 'Admin' && <AdminDashboard />}

        {user.role === 'StoreOwner' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <OwnerDashboard />
            <PasswordUpdate />
          </div>
        )}

        {user.role === 'User' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <UserDashboard />
            <PasswordUpdate />
          </div>
        )}
      </main>
    </div>
  )
}
