import { Outlet, NavLink, useNavigate } from 'react-router'
import { useState } from 'react'
import { useDarkMode } from '../hooks/useDarkMode'
import { useUser } from '../context/UserContext'
import logoSvg from '../imports/logo.png'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠', end: true },
  { path: '/dashboard/roadmap', label: 'Roadmap', icon: '🗺️' },
  { path: '/dashboard/skills', label: 'Skills', icon: '📊' },
  { path: '/dashboard/resume', label: 'Resume', icon: '📄' },
  { path: '/dashboard/recommendations', label: 'Recommendations', icon: '🎯' },
]

export default function DashboardLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dark, toggleDark] = useDarkMode()
  const { profile, logout } = useUser()

  const displayName = profile.name || 'Student'
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('')
  const firstLetter = displayName[0]?.toUpperCase() || 'S'
  const dreamCompanyDisplay = profile.dreamCompany || 'Dream Company'
  const placementDisplay = profile.placementDate
    ? new Date(profile.placementDate + '-01').toLocaleString('default', { month: 'short', year: 'numeric' })
    : 'May 2027'
  const targetRoleShort = (profile.targetRole || 'SDE').replace('Software Developer', 'SDE').replace('Full Stack Developer', 'Full Stack').replace('Data Scientist', 'DS')

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? 240 : 64,
          background: 'var(--card)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 0.25s ease',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 60,
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderBottom: '1px solid var(--border)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onClick={() => navigate('/')}
        >
          <img
            src={logoSvg}
            alt="Confused2Career logo"
            style={{ width: 45, height: 45, objectFit: 'contain', flexShrink: 0 }}
          />
          {sidebarOpen && (
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: 15,
                color: 'var(--foreground)',
                whiteSpace: 'nowrap',
              }}
            >
              Confused<span style={{ color: 'var(--primary)' }}>2</span>Career
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 8px', overflow: 'hidden' }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                marginBottom: 2,
                textDecoration: 'none',
                background: isActive ? 'var(--secondary)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              })}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User card + toggle */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 8px', flexShrink: 0 }}>
          {sidebarOpen && (
            <div
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                marginBottom: 8,
                background: 'var(--secondary)',
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              title="View / Edit Profile"
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 800,
                  flexShrink: 0,
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                {initials || firstLetter}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                  {dreamCompanyDisplay} · {placementDisplay}
                </div>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div
              onClick={() => navigate('/profile')}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                margin: '0 auto 8px',
                fontFamily: 'Outfit, sans-serif',
              }}
              title={`${displayName} — View Profile`}
            >
              {firstLetter}
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--muted-foreground)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {sidebarOpen ? '← Collapse' : '→'}
          </button>
          {/* Logout Button */}
          <button
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
            style={{
              width: '100%',
              padding: '9px 12px',
              marginTop: 8,
              borderRadius: 8,
              border: '1px solid #FECACA',
              background: '#FEF2F2',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div
          style={{
            height: 60,
            padding: '0 28px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--card)',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
            📅 Placement: <strong style={{ color: 'var(--foreground)' }}>{placementDisplay}</strong>
            <span style={{ margin: '0 12px', color: 'var(--border)' }}>|</span>
            🎯 Target: <strong style={{ color: 'var(--foreground)' }}>{dreamCompanyDisplay} {targetRoleShort}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: '4px 12px', borderRadius: 100, background: 'var(--secondary)', color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}>
              🔥 9-day streak
            </div>
            <button
              onClick={toggleDark}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {dark ? '☀️' : '🌙'}
            </button>
            {/* Profile avatar — top right, click → Profile */}
            <div
              onClick={() => navigate('/profile')}
              title={`${displayName} — View Profile`}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
                boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.05)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
            >
              {firstLetter}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: '28px', overflow: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>

    
  ) 
  

}
