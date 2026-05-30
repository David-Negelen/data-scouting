import RadarChart from '@/components/metrics/RadarChart'
import StatBar from '@/components/metrics/StatBar'
import { METRICS, METRIC_CATEGORIES } from '@/constants/metricDefinitions'
import { categoryScore, scoreColor } from '@/utils/metricsCalc'
import { fmtMarketValue } from '@/utils/formatters'

const COLORS = ['#c8f230', '#3b82f6', '#f59e0b', '#ef4444']

export default function CompareView({ players }) {
  if (!players.length) return null

  const cats = ['technical', 'physical', 'tactical', 'matchStats']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Radar overlay */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16 }}>Radar Overview</h3>
        <RadarChart players={players} />
      </div>

      {/* Category scores */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16 }}>Category Scores</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                {players.map((p, i) => (
                  <th key={p.id} style={{ color: COLORS[i] }}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cats.map((cat) => {
                const scores = players.map((p) =>
                  Math.round(categoryScore(p.metrics ?? {}, cat, p.matchLogs ?? [])),
                )
                const max = Math.max(...scores)
                return (
                  <tr key={cat}>
                    <td style={{ color: 'var(--text-muted)' }}>{METRIC_CATEGORIES[cat]?.label}</td>
                    {scores.map((score, i) => (
                      <td
                        key={i}
                        style={{
                          fontFamily: 'JetBrains Mono',
                          fontWeight: 700,
                          color: score === max ? COLORS[i] : 'var(--text-primary)',
                          background: score === max ? `${COLORS[i]}11` : 'transparent',
                        }}
                      >
                        {score}
                        {score === max && scores.filter((s) => s === max).length === 1 && (
                          <span style={{ fontSize: 10, marginLeft: 4 }}>▲</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })}
              {/* Overall */}
              <tr style={{ borderTop: '2px solid var(--border)' }}>
                <td style={{ fontWeight: 700 }}>Overall</td>
                {players.map((p, i) => (
                  <td
                    key={p.id}
                    style={{
                      fontFamily: 'JetBrains Mono',
                      fontWeight: 700,
                      fontSize: 16,
                      color: scoreColor(p.overallScore ?? 0),
                    }}
                  >
                    {p.overallScore ?? 0}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-metric breakdown */}
      {cats.filter((c) => c !== 'matchStats').map((cat) => {
        const catMetrics = METRICS.filter((m) => m.category === cat)
        return (
          <div key={cat} className="card" style={{ padding: 20 }}>
            <h3 style={{ marginBottom: 16, fontSize: 16 }}>{METRIC_CATEGORIES[cat]?.label}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {catMetrics.map((m) => (
                <div key={m.id}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{m.label}</div>
                  {players.map((p, i) => {
                    const val = p.metrics?.[m.id] ?? 0
                    return (
                      <div key={p.id} style={{ marginBottom: 4 }}>
                        <StatBar
                          label={p.name}
                          value={val}
                          max={m.max}
                          color={COLORS[i]}
                        />
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Bio comparison */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16 }}>Profile</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Field</th>
                {players.map((p, i) => (
                  <th key={p.id} style={{ color: COLORS[i] }}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Position', 'position'],
                ['Age', 'age'],
                ['Nationality', 'nationality'],
                ['Club', 'club'],
                ['Contract Until', 'contractUntil'],
                ['Market Value', null, (p) => fmtMarketValue(p.marketValue)],
                ['Status', 'status'],
              ].map(([label, key, fmt]) => (
                <tr key={label}>
                  <td style={{ color: 'var(--text-muted)' }}>{label}</td>
                  {players.map((p) => (
                    <td key={p.id}>{fmt ? fmt(p) : (p[key] ?? '—')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
