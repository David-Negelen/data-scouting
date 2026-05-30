import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayer } from '@/hooks/usePlayers'
import { usePlayersStore } from '@/store'
import RadarChart from '@/components/metrics/RadarChart'
import MetricsPanel from '@/components/metrics/MetricsPanel'
import MatchLog from '@/components/matches/MatchLog'
import ScoutingReport from '@/components/scouting/ScoutingReport'
import PlayerForm from '@/components/players/PlayerForm'
import ReportPrint from '@/components/scouting/ReportPrint'
import { useScoutingReports } from '@/hooks/useScoutingReports'
import { scoreColor, scoreTrend } from '@/utils/metricsCalc'
import { fmtMarketValue, fmtDate, flagUrl } from '@/utils/formatters'
import { STATUS_COLORS, RECOMMENDATION_COLORS } from '@/constants/metricDefinitions'

const TABS = ['Overview', 'Metrics', 'Match Logs', 'Reports', 'Print']

export default function PlayerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const player = usePlayer(id)
  const updatePlayer = usePlayersStore((s) => s.updatePlayer)
  const deletePlayer = usePlayersStore((s) => s.deletePlayer)
  const reports = useScoutingReports(id)

  const [tab, setTab] = useState('Overview')
  const [editing, setEditing] = useState(false)

  if (!player) {
    return (
      <div className="empty-state">
        <p>Player not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/players')}>← Back</button>
      </div>
    )
  }

  const score = player.overallScore ?? 0
  const trend = scoreTrend(player)
  const flag = flagUrl(player.nationalityCode)
  const statusColor = STATUS_COLORS[player.status] ?? 'var(--text-muted)'
  const latestReport = reports[0]

  const handleMetricChange = (metricId, value) => {
    updatePlayer(id, { metrics: { ...player.metrics, [metricId]: value } })
  }

  const handleDelete = () => {
    if (window.confirm(`Delete ${player.name} from your database?`)) {
      deletePlayer(id)
      navigate('/players')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Profile header */}
      <div className="card" style={{ padding: '20px 24px' }}>
        {editing ? (
          <div>
            <h3 style={{ marginBottom: 14, fontSize: 16 }}>Edit Profile</h3>
            <PlayerForm
              initialValues={player}
              onSubmit={(data) => { updatePlayer(id, data); setEditing(false) }}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {player.photo ? (
              <img
                src={player.photo}
                alt={player.name}
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border)', flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'var(--bg-surface)', border: '3px solid var(--border)',
                  display: 'grid', placeItems: 'center',
                  fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 28,
                  color: 'var(--text-muted)', flexShrink: 0,
                }}
              >
                {(player.name ?? '?').split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 28, lineHeight: 1 }}>{player.name}</h1>
                {player.position && (
                  <span className="badge" style={{ background: 'rgba(200,242,48,.12)', color: 'var(--accent-primary)' }}>
                    {player.position}
                  </span>
                )}
                {player.status && (
                  <span className="badge" style={{ background: `${statusColor}22`, color: statusColor }}>
                    {player.status}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)' }}>
                {flag && <img src={flag} alt={player.nationality} style={{ height: 14, borderRadius: 2 }} />}
                {player.nationality && <span>{player.nationality}</span>}
                {player.age && <span>{player.age} years</span>}
                {player.club && <span>🏟 {player.club}</span>}
                {player.league && <span>{player.league}</span>}
                {player.contractUntil && <span>📅 Contract until {fmtDate(player.contractUntil, 'MMM yyyy')}</span>}
                {player.marketValue && (
                  <span style={{ color: 'var(--success)', fontFamily: 'JetBrains Mono' }}>
                    {fmtMarketValue(player.marketValue)}
                  </span>
                )}
              </div>

              {latestReport && (
                <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Latest recommendation:</span>
                  <span
                    className="badge"
                    style={{
                      background: `${RECOMMENDATION_COLORS[latestReport.recommendation]}22`,
                      color: RECOMMENDATION_COLORS[latestReport.recommendation],
                    }}
                  >
                    {latestReport.recommendation}
                  </span>
                </div>
              )}
            </div>

            {/* Score */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <div
                className="score-badge"
                style={{ color: scoreColor(score), width: 64, height: 64, fontSize: 22 }}
              >
                {score}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Overall
              </div>
              {trend && (
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: trend.direction === 'up' ? 'var(--success)' : trend.direction === 'down' ? 'var(--danger)' : 'var(--text-muted)',
                  }}
                >
                  {trend.direction === 'up' ? '▲' : trend.direction === 'down' ? '▼' : '●'}
                  {' '}{Math.abs(trend.delta)}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignSelf: 'flex-start' }}>
              <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div>
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ paddingTop: 20 }}>
          {tab === 'Overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 14, fontSize: 16 }}>Performance Radar</h3>
                <RadarChart players={[player]} />
              </div>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 14, fontSize: 16 }}>Attributes</h3>
                <MetricsPanel player={player} readOnly />
              </div>
            </div>
          )}
          {tab === 'Metrics' && (
            <div className="card" style={{ padding: 20 }}>
              <MetricsPanel player={player} onMetricChange={handleMetricChange} />
            </div>
          )}
          {tab === 'Match Logs' && (
            <MatchLog player={player} />
          )}
          {tab === 'Reports' && (
            <ScoutingReport playerId={id} />
          )}
          {tab === 'Print' && (
            <ReportPrint player={player} report={latestReport} />
          )}
        </div>
      </div>
    </div>
  )
}
