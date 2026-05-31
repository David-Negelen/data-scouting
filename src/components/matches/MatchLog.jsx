import { useState } from 'react'
import { usePlayersStore } from '@/store'
import MatchStatForm from './MatchStatForm'
import { fmtDate } from '@/utils/formatters'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from 'recharts'

function Sparkline({ data }) {
  if (!data?.length) return null
  return (
    <ResponsiveContainer width={80} height={28}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--accent-primary)"
          strokeWidth={1.5}
          dot={false}
        />
        <Tooltip
          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: 11 }}
          labelFormatter={() => ''}
          formatter={(v) => [v, '']}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function MatchLog({ player }) {
  const deleteMatchLog = usePlayersStore((s) => s.deleteMatchLog)
  const [addingNew, setAddingNew] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const allLogs = [...(player.matchLogs ?? [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  )
  const seasonLogs = allLogs.filter((l) => l.isSeason || l.competition === 'FotMob Import')
  const matchLogs  = allLogs.filter((l) => !l.isSeason && l.competition !== 'FotMob Import')

  const goalsData = matchLogs
    .slice()
    .reverse()
    .map((l, i) => ({ i, value: l.goals ?? 0 }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Season stats from FotMob */}
      {seasonLogs.map((log) => {
        const stats = [
          { label: 'Apps',    value: log.apps },
          { label: 'Started', value: log.started },
          { label: 'Mins',    value: log.totalMinutes },
          { label: 'Goals',   value: log.goals },
          { label: 'Assists', value: log.assists },
          { label: 'xG',      value: log.xG != null ? Number(log.xG).toFixed(2) : null },
          { label: 'xA',      value: log.xA != null ? Number(log.xA).toFixed(2) : null },
          { label: 'KP',      value: log.keyPasses },
          { label: 'SoT',     value: log.shotOnTarget },
          { label: 'Int',     value: log.interceptions },
          { label: 'Rating',  value: log.rating != null ? Number(log.rating).toFixed(2) : null },
          { label: 'YC',      value: log.yellowCards || null },
          { label: 'RC',      value: log.redCards || null },
        ].filter(({ value }) => value != null)

        return (
          <div
            key={log.id}
            className="card"
            style={{ padding: '12px 16px', borderLeft: '3px solid var(--accent-primary)', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <div style={{ minWidth: 120 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{log.opponent}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>FotMob · Season Stats</div>
            </div>
            <div style={{ display: 'flex', gap: 12, flex: 1, flexWrap: 'wrap' }}>
              {stats.map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 14, color: 'var(--accent-primary)' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 11, padding: '3px 8px', color: 'var(--danger)', flexShrink: 0 }}
              onClick={() => deleteMatchLog(player.id, log.id)}
            >
              Delete
            </button>
          </div>
        )
      })}

      {/* Match log header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'Matches', value: matchLogs.length },
            { label: 'Goals',   value: matchLogs.reduce((a, l) => a + (l.goals ?? 0), 0) },
            { label: 'Assists', value: matchLogs.reduce((a, l) => a + (l.assists ?? 0), 0) },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 18, color: 'var(--accent-primary)' }}>
                {value}
              </div>
            </div>
          ))}
          {goalsData.length > 1 && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Goals trend</div>
              <Sparkline data={goalsData} />
            </div>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => setAddingNew(true)} disabled={addingNew}>
          + Log Match
        </button>
      </div>

      {addingNew && (
        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ marginBottom: 14, fontFamily: 'Barlow Condensed', fontSize: 16 }}>Log New Match</h4>
          <MatchStatForm playerId={player.id} onDone={() => setAddingNew(false)} />
        </div>
      )}

      {!matchLogs.length && !addingNew && (
        <div className="empty-state">
          <p>No match logs yet.</p>
          <button className="btn btn-secondary" onClick={() => setAddingNew(true)}>Log first match</button>
        </div>
      )}

      {matchLogs.map((log) => {
        if (editingId === log.id) {
          return (
            <div key={log.id} className="card" style={{ padding: 20 }}>
              <MatchStatForm
                playerId={player.id}
                existingLog={log}
                onDone={() => setEditingId(null)}
              />
            </div>
          )
        }

        const keyStats = [
          { label: 'G',    value: log.goals },
          { label: 'A',    value: log.assists },
          { label: 'KP',   value: log.keyPasses },
          { label: 'xG',   value: log.xG?.toFixed?.(2) },
          { label: 'Mins', value: log.minutesPlayed },
        ].filter(({ value }) => value != null && value !== 0)

        return (
          <div
            key={log.id}
            className="card"
            style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
          >
            <div style={{ minWidth: 90 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{fmtDate(log.date)}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.competition}</div>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600 }}>vs {log.opponent || '?'}</span>
              {log.result && (
                <span style={{ marginLeft: 8, fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-muted)' }}>
                  {log.result}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {keyStats.map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 14, color: 'var(--accent-primary)' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => setEditingId(log.id)}>
                Edit
              </button>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 11, padding: '3px 8px', color: 'var(--danger)' }}
                onClick={() => deleteMatchLog(player.id, log.id)}
              >
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
