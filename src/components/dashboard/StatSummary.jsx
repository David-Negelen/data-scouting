import { STATUS_COLORS } from '@/constants/metricDefinitions'

function StatCard({ label, value, sub, color }) {
  return (
    <div
      className="card"
      style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}
    >
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: 'JetBrains Mono',
          fontWeight: 700,
          fontSize: 32,
          color: color ?? 'var(--text-primary)',
          lineHeight: 1,
        }}
      >
        {value ?? 0}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

export default function StatSummary({ players, byStatus }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 12,
      }}
    >
      <StatCard
        label="Total Players"
        value={players.length}
        sub="in database"
        color="var(--accent-primary)"
      />
      {Object.entries(STATUS_COLORS).map(([status, color]) => (
        <StatCard
          key={status}
          label={status}
          value={byStatus[status] ?? 0}
          color={color}
        />
      ))}
    </div>
  )
}
