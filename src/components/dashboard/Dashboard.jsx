import { useNavigate } from 'react-router-dom'
import { usePlayers } from '@/hooks/usePlayers'
import StatSummary from './StatSummary'
import RecentActivity from './RecentActivity'
import { scoreColor, scoreTrend } from '@/utils/metricsCalc'
import { flagUrl } from '@/utils/formatters'

function TopPlayerRow({ player, rank }) {
  const navigate = useNavigate()
  const trend = scoreTrend(player)
  const flag = flagUrl(player.nationalityCode)

  return (
    <div
      onClick={() => navigate(`/players/${player.id}`)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 0',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    >
      <span
        style={{
          fontFamily: 'JetBrains Mono',
          fontWeight: 700,
          fontSize: 13,
          color: rank === 1 ? 'var(--accent-primary)' : 'var(--text-muted)',
          width: 20,
          textAlign: 'center',
        }}
      >
        {rank}
      </span>
      {player.photo ? (
        <img
          src={player.photo}
          alt=""
          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--bg-surface)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-muted)',
          }}
        >
          {(player.name ?? '?')[0]}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {player.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 6 }}>
          {flag && <img src={flag} alt="" style={{ height: 10 }} />}
          <span>{player.position} · {player.club}</span>
        </div>
      </div>
      <div style={{ display: 'flex', align: 'center', gap: 8 }}>
        {trend && (
          <span
            style={{
              fontSize: 12,
              color: trend.direction === 'up' ? 'var(--success)' : trend.direction === 'down' ? 'var(--danger)' : 'var(--text-muted)',
            }}
          >
            {trend.direction === 'up' ? '▲' : trend.direction === 'down' ? '▼' : '●'}
            {Math.abs(trend.delta)}
          </span>
        )}
        <span
          style={{
            fontFamily: 'JetBrains Mono',
            fontWeight: 700,
            fontSize: 16,
            color: scoreColor(player.overallScore ?? 0),
          }}
        >
          {player.overallScore}
        </span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { players, byStatus, top5 } = usePlayers()
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <StatSummary players={players} byStatus={byStatus} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        {/* Top Players */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 17 }}>Top Players</h2>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/players')}>
              View all →
            </button>
          </div>
          {top5.length ? (
            top5.map((p, i) => <TopPlayerRow key={p.id} player={p} rank={i + 1} />)
          ) : (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <p style={{ fontSize: 13 }}>No players yet.</p>
              <button className="btn btn-primary" onClick={() => navigate('/players')}>
                Add player
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 17, marginBottom: 14 }}>Recent Activity</h2>
          <RecentActivity />
        </div>
      </div>

      {/* Quick stats */}
      {players.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {[
            {
              label: 'Avg Overall Score',
              value: Math.round(players.reduce((a, p) => a + (p.overallScore ?? 0), 0) / players.length),
              color: 'var(--accent-primary)',
            },
            {
              label: 'Total Match Logs',
              value: players.reduce((a, p) => a + (p.matchLogs?.length ?? 0), 0),
              color: 'var(--success)',
            },
            {
              label: 'Avg Age',
              value: (() => {
                const withAge = players.filter((p) => p.age)
                return withAge.length
                  ? Math.round(withAge.reduce((a, p) => a + p.age, 0) / withAge.length)
                  : '—'
              })(),
              color: 'var(--accent-secondary)',
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 28, color }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
