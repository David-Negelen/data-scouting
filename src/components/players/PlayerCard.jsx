import { useNavigate } from 'react-router-dom'
import { scoreColor } from '@/utils/metricsCalc'
import { fmtMarketValue, flagUrl } from '@/utils/formatters'
import { STATUS_COLORS } from '@/constants/metricDefinitions'
import { POSITIONS, positionCategoryColor } from '@/constants/positions'

function Avatar({ player }) {
  const initials = (player.name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return player.photo ? (
    <img
      src={player.photo}
      alt={player.name}
      style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid var(--border)',
        flexShrink: 0,
      }}
      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'grid' }}
    />
  ) : (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: 'var(--bg-surface)',
        border: '2px solid var(--border)',
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'Barlow Condensed',
        fontWeight: 700,
        fontSize: 18,
        color: 'var(--text-muted)',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

export default function PlayerCard({ player, onCompareToggle, compareSelected }) {
  const navigate = useNavigate()
  const pos = POSITIONS.find((p) => p.id === player.position)
  const posColor = positionCategoryColor[pos?.category] ?? 'var(--text-muted)'
  const score = player.overallScore ?? 0
  const statusColor = STATUS_COLORS[player.status] ?? 'var(--text-muted)'
  const flag = flagUrl(player.nationalityCode)

  return (
    <div
      className="card"
      style={{ padding: 16, cursor: 'pointer', userSelect: 'none' }}
      onClick={() => navigate(`/players/${player.id}`)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <Avatar player={player} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'Barlow Condensed',
              fontWeight: 700,
              fontSize: 17,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {player.name ?? 'Unknown'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
            {flag && (
              <img src={flag} alt={player.nationality} style={{ height: 12, borderRadius: 2 }} />
            )}
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{player.nationality}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>·</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{player.age ? `${player.age}y` : ''}</span>
          </div>
        </div>

        {/* Overall score */}
        <div
          className="score-badge"
          style={{ color: scoreColor(score), fontSize: 15, width: 40, height: 40 }}
        >
          {score}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {player.position && (
          <span className="badge" style={{ background: `${posColor}22`, color: posColor }}>
            {player.position}
          </span>
        )}
        {player.status && (
          <span className="badge" style={{ background: `${statusColor}22`, color: statusColor }}>
            {player.status}
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {player.club ?? '—'}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--success)', flexShrink: 0 }}>
          {fmtMarketValue(player.marketValue)}
        </span>
      </div>

      {onCompareToggle && (
        <button
          className={`btn ${compareSelected ? 'btn-primary' : 'btn-secondary'}`}
          style={{ marginTop: 10, width: '100%', justifyContent: 'center', fontSize: 12, padding: '5px 10px' }}
          onClick={(e) => { e.stopPropagation(); onCompareToggle(player.id) }}
        >
          {compareSelected ? '✓ In comparison' : '+ Compare'}
        </button>
      )}
    </div>
  )
}
