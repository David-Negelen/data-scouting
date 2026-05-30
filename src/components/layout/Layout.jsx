import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const PAGE_TITLES = {
  '/':          'Dashboard',
  '/players':   'Players',
  '/compare':   'Compare',
  '/reports':   'Scouting Reports',
  '/settings':  'Settings',
}

export default function Layout() {
  const { pathname } = useLocation()
  const title =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith('/players/') ? 'Player Profile' : 'Scout')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div
        style={{
          marginLeft: 'var(--sidebar-width)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Topbar title={title} />
        <main
          style={{
            marginTop: 'var(--topbar-height)',
            padding: '24px',
            flex: 1,
            minHeight: 0,
          }}
          className="page-enter"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
