import { useState } from 'react'
import { usePlayersStore } from '@/store'
import { METRICS } from '@/constants/metricDefinitions'

const MATCH_STAT_METRICS = METRICS.filter((m) => m.category === 'matchStats')

const DEFAULT_LOG = {
  date: new Date().toISOString().split('T')[0],
  opponent: '',
  competition: '',
  result: '',
  minutesPlayed: 90,
}

export default function MatchStatForm({ playerId, existingLog, onDone }) {
  const addMatchLog = usePlayersStore((s) => s.addMatchLog)
  const updateMatchLog = usePlayersStore((s) => s.updateMatchLog)

  const [base, setBase] = useState({ ...DEFAULT_LOG, ...existingLog })
  const [stats, setStats] = useState(() => {
    const init = {}
    MATCH_STAT_METRICS.forEach((m) => { init[m.id] = existingLog?.[m.id] ?? 0 })
    return init
  })

  const setBase_ = (k, v) => setBase((b) => ({ ...b, [k]: v }))
  const setStat  = (k, v) => setStats((s) => ({ ...s, [k]: v }))

  const handleSave = () => {
    const log = { ...base, ...stats }
    if (existingLog?.id) {
      updateMatchLog(playerId, existingLog.id, log)
    } else {
      addMatchLog(playerId, log)
    }
    onDone?.()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Match meta */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        {[
          { label: 'Date', key: 'date', type: 'date' },
          { label: 'Opponent', key: 'opponent' },
          { label: 'Competition', key: 'competition' },
          { label: 'Result (e.g. 2-1)', key: 'result' },
          { label: 'Minutes Played', key: 'minutesPlayed', type: 'number' },
        ].map(({ label, key, type = 'text' }) => (
          <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </span>
            <input
              className="input"
              type={type}
              value={base[key] ?? ''}
              min={type === 'number' ? 0 : undefined}
              max={key === 'minutesPlayed' ? 120 : undefined}
              onChange={(e) => setBase_(key, type === 'number' ? Number(e.target.value) : e.target.value)}
            />
          </label>
        ))}
      </div>

      {/* Stats grid */}
      <div>
        <h4 style={{ fontFamily: 'Barlow Condensed', marginBottom: 10, fontSize: 15 }}>Match Statistics</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {MATCH_STAT_METRICS.map((m) => (
            <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }} title={m.description}>
              <span style={{ flex: 1, fontSize: 12, color: 'var(--text-muted)' }}>{m.label}</span>
              <input
                className="input"
                type="number"
                min={0}
                max={m.max}
                step={m.id === 'xG' || m.id === 'xA' || m.id === 'distanceCovered' ? 0.01 : 1}
                value={stats[m.id] ?? 0}
                style={{ width: 70, textAlign: 'right' }}
                onChange={(e) => setStat(m.id, Number(e.target.value))}
              />
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {onDone && (
          <button className="btn btn-secondary" onClick={onDone}>Cancel</button>
        )}
        <button className="btn btn-primary" onClick={handleSave}>
          {existingLog?.id ? 'Update Log' : 'Save Match'}
        </button>
      </div>
    </div>
  )
}
