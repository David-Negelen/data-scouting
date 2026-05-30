import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReportsStore } from '@/store'
import { usePlayers } from '@/hooks/usePlayers'
import { fmtDate, fmtRelative } from '@/utils/formatters'
import { RECOMMENDATION_COLORS } from '@/constants/metricDefinitions'

export default function ScoutingReportPage() {
  const navigate = useNavigate()
  const reports = useReportsStore((s) => s.reports)
  const { players } = usePlayers()
  const [filterRec, setFilterRec] = useState('')

  const playerMap = Object.fromEntries(players.map((p) => [p.id, p]))

  const sorted = [...reports]
    .filter((r) => !filterRec || r.recommendation === filterRec)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          className="input"
          style={{ maxWidth: 180 }}
          value={filterRec}
          onChange={(e) => setFilterRec(e.target.value)}
        >
          <option value="">All recommendations</option>
          {Object.keys(RECOMMENDATION_COLORS).map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {sorted.length} report{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      {!sorted.length && (
        <div className="empty-state">
          <p>No scouting reports yet.</p>
          <button className="btn btn-secondary" onClick={() => navigate('/players')}>
            Go to Players to write a report
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.map((r) => {
          const player = playerMap[r.playerId]
          const recColor = RECOMMENDATION_COLORS[r.recommendation] ?? 'var(--text-muted)'

          return (
            <div
              key={r.id}
              className="card"
              style={{ padding: '14px 18px', cursor: 'pointer' }}
              onClick={() => navigate(`/players/${r.playerId}?tab=Reports`)}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 17 }}>
                    {player?.name ?? 'Unknown Player'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {player?.position} · {player?.club}
                    {r.matchDate && ` · Observed ${fmtDate(r.matchDate)}`}
                    {r.competition && ` · ${r.competition}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {r.recommendation && (
                    <span className="badge" style={{ background: `${recColor}22`, color: recColor }}>
                      {r.recommendation}
                    </span>
                  )}
                  {r.overallRating && (
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono',
                        fontWeight: 700,
                        fontSize: 15,
                        color: 'var(--accent-primary)',
                      }}
                    >
                      {r.overallRating}/10
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {fmtRelative(r.createdAt)}
                  </span>
                </div>
              </div>
              {r.content && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                  dangerouslySetInnerHTML={{ __html: r.content }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
