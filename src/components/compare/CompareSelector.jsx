import { useState } from 'react'
import { usePlayers } from '@/hooks/usePlayers'
import { flagUrl } from '@/utils/formatters'

export default function CompareSelector({ selectedIds, onToggle }) {
  const { players } = usePlayers()
  const [search, setSearch] = useState('')

  const filtered = search
    ? players.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()))
    : players

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <input
          className="input"
          placeholder="Search players to compare…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          maxHeight: 420,
          overflowY: 'auto',
        }}
      >
        {filtered.map((p) => {
          const selected = selectedIds.includes(p.id)
          const flag = flagUrl(p.nationalityCode)
          return (
            <div
              key={p.id}
              onClick={() => onToggle(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${selected ? 'var(--accent-primary)' : 'var(--border)'}`,
                background: selected ? 'rgba(200,242,48,.06)' : 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: `2px solid ${selected ? 'var(--accent-primary)' : 'var(--border)'}`,
                  background: selected ? 'var(--accent-primary)' : 'transparent',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                {selected && (
                  <svg viewBox="0 0 10 10" fill="none" style={{ width: 10, height: 10 }}>
                    <path d="M2 5l2.5 2.5 3.5-4" stroke="#0d0f14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              {flag && <img src={flag} alt="" style={{ height: 12 }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {p.position} · {p.club}
                </div>
              </div>
              <span
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                }}
              >
                {p.overallScore}
              </span>
            </div>
          )
        })}
        {!filtered.length && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
            No players found.
          </p>
        )}
      </div>
    </div>
  )
}
