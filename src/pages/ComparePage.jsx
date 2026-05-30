import { useState } from 'react'
import { usePlayers } from '@/hooks/usePlayers'
import CompareSelector from '@/components/compare/CompareSelector'
import CompareView from '@/components/compare/CompareView'

export default function ComparePage() {
  const { players } = usePlayers()
  const [selectedIds, setSelectedIds] = useState([])

  const toggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev,
    )
  }

  const selected = players.filter((p) => selectedIds.includes(p.id))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'flex-start' }}>
      {/* Sidebar selector */}
      <div className="card" style={{ padding: 16, position: 'sticky', top: 80 }}>
        <h3 style={{ marginBottom: 12, fontSize: 16 }}>Select Players</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          Choose 2–4 players to compare side-by-side.
        </p>
        {selectedIds.length > 0 && (
          <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {selected.map((p) => (
              <span
                key={p.id}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 8px', borderRadius: 99,
                  background: 'rgba(200,242,48,.12)', color: 'var(--accent-primary)',
                  fontSize: 12, fontWeight: 600,
                }}
              >
                {p.name}
                <button
                  onClick={() => toggle(p.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            ))}
            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '2px 6px' }} onClick={() => setSelectedIds([])}>
              Clear
            </button>
          </div>
        )}
        <CompareSelector selectedIds={selectedIds} onToggle={toggle} />
      </div>

      {/* Compare view */}
      <div>
        {selected.length < 2 ? (
          <div className="empty-state">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" style={{ width: 48, height: 48, opacity: 0.25 }}>
              <rect x="4" y="8" width="16" height="32" rx="2" strokeWidth="2" />
              <rect x="28" y="8" width="16" height="32" rx="2" strokeWidth="2" />
              <path d="M20 24h8" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p>Select at least 2 players to compare.</p>
          </div>
        ) : (
          <CompareView players={selected} />
        )}
      </div>
    </div>
  )
}
