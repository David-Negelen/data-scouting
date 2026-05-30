import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayers } from '@/hooks/usePlayers'
import { useReportsStore } from '@/store'
import { fmtRelative } from '@/utils/formatters'
import { RECOMMENDATION_COLORS } from '@/constants/metricDefinitions'

export default function RecentActivity() {
  const navigate = useNavigate()
  const { players } = usePlayers()
  const reports = useReportsStore((s) => s.reports)

  const events = useMemo(() => {
    const items = []

    players.forEach((p) => {
      items.push({
        type: 'player',
        id: p.id,
        label: p.name,
        sub: `Added to scouting database`,
        time: p.createdAt,
        color: 'var(--accent-secondary)',
      })
      ;(p.matchLogs ?? []).forEach((l) => {
        items.push({
          type: 'match',
          id: p.id,
          label: `${p.name} vs ${l.opponent || '?'}`,
          sub: `G:${l.goals ?? 0} A:${l.assists ?? 0} xG:${l.xG?.toFixed?.(1) ?? 0}`,
          time: l.date,
          color: 'var(--success)',
        })
      })
    })

    reports.forEach((r) => {
      const player = players.find((p) => p.id === r.playerId)
      const recColor = RECOMMENDATION_COLORS[r.recommendation] ?? 'var(--text-muted)'
      items.push({
        type: 'report',
        id: r.playerId,
        label: `Report: ${player?.name ?? 'Unknown'}`,
        sub: r.recommendation,
        time: r.createdAt,
        color: recColor,
      })
    })

    return items
      .filter((x) => x.time)
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 15)
  }, [players, reports])

  if (!events.length) {
    return (
      <div className="empty-state" style={{ padding: '24px 0' }}>
        <p style={{ fontSize: 13 }}>No activity yet. Add your first player to get started.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {events.map((ev, i) => (
        <div
          key={i}
          onClick={() => navigate(`/players/${ev.id}`)}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '10px 0',
            borderBottom: i < events.length - 1 ? '1px solid var(--border)' : 'none',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: ev.color,
              marginTop: 5,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ev.label}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ev.sub}</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
            {fmtRelative(ev.time)}
          </div>
        </div>
      ))}
    </div>
  )
}
