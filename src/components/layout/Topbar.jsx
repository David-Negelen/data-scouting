import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayers } from '@/hooks/usePlayers'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export default function Topbar({ title }) {
  const navigate = useNavigate()
  const { players } = usePlayers()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useLocalStorage('scout-theme', 'dark')
  const ref = useRef()

  const results = query.length >= 2
    ? players.filter((p) => p.name?.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : []

  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'light' ? 'light' : ''
  }, [theme])

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const pick = (id) => {
    navigate(`/players/${id}`)
    setQuery('')
    setOpen(false)
  }

  return (
    <header
      id="topbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 'var(--sidebar-width)',
        right: 0,
        height: 'var(--topbar-height)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 20px',
        zIndex: 30,
      }}
    >
      <h1
        style={{
          fontFamily: 'Barlow Condensed',
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: '0.03em',
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
          marginRight: 8,
        }}
      >
        {title}
      </h1>

      {/* Global search */}
      <div ref={ref} style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
        <div style={{ position: 'relative' }}>
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 14,
              height: 14,
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M14 14l4 4" strokeLinecap="round" />
          </svg>
          <input
            className="input"
            style={{ paddingLeft: 32 }}
            placeholder="Search players…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
          />
        </div>
        {open && results.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              zIndex: 100,
            }}
          >
            {results.map((p) => (
              <div
                key={p.id}
                onClick={() => pick(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {p.photo && (
                  <img
                    src={p.photo}
                    alt=""
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {p.position} · {p.club}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <button
          className="btn btn-ghost"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle theme"
          style={{ padding: '6px 8px' }}
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
