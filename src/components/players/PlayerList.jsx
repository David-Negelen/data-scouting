import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PlayerCard from './PlayerCard'
import { scoreColor } from '@/utils/metricsCalc'
import { fmtMarketValue, flagUrl } from '@/utils/formatters'
import { STATUS_COLORS } from '@/constants/metricDefinitions'
import { POSITIONS } from '@/constants/positions'

const SORT_OPTIONS = [
  { id: 'score-desc', label: 'Score ↓' },
  { id: 'score-asc', label: 'Score ↑' },
  { id: 'name-asc', label: 'Name A–Z' },
  { id: 'age-asc', label: 'Age ↑' },
  { id: 'newest', label: 'Newest' },
]

export default function PlayerList({
  players,
  view = 'grid',
  compareIds = [],
  onCompareToggle,
}) {
  const navigate = useNavigate()
  const [sort, setSort] = useState('score-desc')
  const [filterPos, setFilterPos] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = [...players]
    if (search) list = list.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()))
    if (filterPos) list = list.filter((p) => p.position === filterPos)
    if (filterStatus) list = list.filter((p) => p.status === filterStatus)

    list.sort((a, b) => {
      if (sort === 'score-desc') return (b.overallScore ?? 0) - (a.overallScore ?? 0)
      if (sort === 'score-asc')  return (a.overallScore ?? 0) - (b.overallScore ?? 0)
      if (sort === 'name-asc')   return (a.name ?? '').localeCompare(b.name ?? '')
      if (sort === 'age-asc')    return (a.age ?? 99) - (b.age ?? 99)
      if (sort === 'newest')     return new Date(b.createdAt) - new Date(a.createdAt)
      return 0
    })
    return list
  }, [players, search, filterPos, filterStatus, sort])

  const Filters = (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
      <input
        className="input"
        style={{ maxWidth: 200 }}
        placeholder="Filter by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select className="input" style={{ maxWidth: 130 }} value={filterPos} onChange={(e) => setFilterPos(e.target.value)}>
        <option value="">All positions</option>
        {POSITIONS.map((p) => (
          <option key={p.id} value={p.id}>{p.id} – {p.label}</option>
        ))}
      </select>
      <select className="input" style={{ maxWidth: 140 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
        <option value="">All statuses</option>
        {['Prospect', 'Target', 'Watchlist', 'Rejected'].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select className="input" style={{ maxWidth: 140 }} value={sort} onChange={(e) => setSort(e.target.value)}>
        {SORT_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
        {filtered.length} player{filtered.length !== 1 ? 's' : ''}
      </span>
    </div>
  )

  if (!filtered.length) {
    return (
      <>
        {Filters}
        <div className="empty-state">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" style={{ width: 48, height: 48, opacity: 0.3 }}>
            <circle cx="24" cy="24" r="20" strokeWidth="2" />
            <path d="M16 24h16M24 16v16" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p>No players found.</p>
        </div>
      </>
    )
  }

  if (view === 'table') {
    return (
      <>
        {Filters}
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Pos</th>
                <th>Age</th>
                <th>Club</th>
                <th>Status</th>
                <th>Market Value</th>
                <th>Score</th>
                {onCompareToggle && <th></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const flag = flagUrl(p.nationalityCode)
                const statusColor = STATUS_COLORS[p.status] ?? 'var(--text-muted)'
                const score = p.overallScore ?? 0
                return (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/players/${p.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {flag && <img src={flag} alt="" style={{ height: 12 }} />}
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                      </div>
                    </td>
                    <td>{p.position ?? '—'}</td>
                    <td>{p.age ?? '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.club ?? '—'}</td>
                    <td>
                      {p.status && (
                        <span className="badge" style={{ background: `${statusColor}22`, color: statusColor }}>
                          {p.status}
                        </span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--success)' }}>
                      {fmtMarketValue(p.marketValue)}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: scoreColor(score) }}>
                        {score}
                      </span>
                    </td>
                    {onCompareToggle && (
                      <td>
                        <button
                          className={`btn ${compareIds.includes(p.id) ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ fontSize: 11, padding: '3px 8px' }}
                          onClick={(e) => { e.stopPropagation(); onCompareToggle(p.id) }}
                        >
                          {compareIds.includes(p.id) ? '✓' : '+'}
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  // Grid view
  return (
    <>
      {Filters}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 14,
        }}
      >
        {filtered.map((p) => (
          <PlayerCard
            key={p.id}
            player={p}
            compareSelected={compareIds.includes(p.id)}
            onCompareToggle={onCompareToggle}
          />
        ))}
      </div>
    </>
  )
}
