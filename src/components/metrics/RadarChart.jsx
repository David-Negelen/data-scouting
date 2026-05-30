import {
  Radar,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { radarData } from '@/utils/metricsCalc'

const COLORS = ['#c8f230', '#3b82f6', '#f59e0b', '#ef4444']

export default function RadarChart({ players }) {
  if (!players?.length) return null

  // Build unified axis subjects
  const primaryData = radarData(players[0])
  const subjects = primaryData.map((d) => d.subject)

  const chartData = subjects.map((subject) => {
    const entry = { subject }
    players.forEach((p, i) => {
      const d = radarData(p).find((x) => x.subject === subject)
      entry[`p${i}`] = d?.value ?? 0
    })
    return entry
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ReRadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Barlow Condensed' }}
        />
        {players.map((p, i) => (
          <Radar
            key={p.id}
            name={p.name ?? `Player ${i + 1}`}
            dataKey={`p${i}`}
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={players.length === 1 ? 0.2 : 0.1}
            dot={false}
          />
        ))}
        {players.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans', paddingTop: 8 }}
            formatter={(value) => <span style={{ color: 'var(--text-primary)' }}>{value}</span>}
          />
        )}
      </ReRadarChart>
    </ResponsiveContainer>
  )
}
