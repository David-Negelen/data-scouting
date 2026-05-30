export default function StatBar({ label, value, max = 100, color = 'var(--accent-primary)', suffix = '' }) {
  const pct = Math.min(100, ((value ?? 0) / max) * 100)

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 4,
          fontSize: 12,
        }}
      >
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color }}>
          {value ?? '—'}{suffix}
        </span>
      </div>
      <div
        style={{
          height: 4,
          background: 'var(--border)',
          borderRadius: 99,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 99,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}
