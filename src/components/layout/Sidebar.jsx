import { NavLink } from 'react-router-dom'

const NAV = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M2 4a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm0 9a1 1 0 011-1h5a1 1 0 011 1v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3zm9-9a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z" />
      </svg>
    ),
  },
  {
    to: '/players',
    label: 'Players',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    to: '/compare',
    label: 'Compare',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M4 4a1 1 0 011-1h4a1 1 0 010 2H6.414l6.293 6.293a1 1 0 01-1.414 1.414L5 6.414V9a1 1 0 01-2 0V5a1 1 0 011-1zm11 9a1 1 0 00-1-1h-2.586l-6.293-6.293A1 1 0 103.707 7.12L10 13.414V11a1 1 0 102 0v4a1 1 0 001 1h4a1 1 0 000-2h-2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  return (
    <aside
      id="sidebar"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--accent-primary)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 20 20" fill="#0d0f14" className="w-4 h-4">
              <circle cx="10" cy="10" r="8" fill="#0d0f14" />
              <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zM10 5l1.545 3.13 3.455.502-2.5 2.437.59 3.44L10 12.77l-3.09 1.739.59-3.44L5 8.632l3.455-.502L10 5z" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontFamily: 'Barlow Condensed',
                fontWeight: 800,
                fontSize: 16,
                color: 'var(--text-primary)',
                letterSpacing: '0.05em',
              }}
            >
              SOCCER SCOUT
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              ANALYTICS
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 7,
              color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
              background: isActive ? 'rgba(200,242,48,.08)' : 'transparent',
              textDecoration: 'none',
              fontFamily: 'DM Sans',
              fontWeight: 500,
              fontSize: 13,
              transition: 'all 0.15s',
            })}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}
      >
        Soccer Scout v1.0
      </div>
    </aside>
  )
}
