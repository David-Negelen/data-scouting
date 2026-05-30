export default function MetricSlider({ metric, value, onChange, readOnly = false }) {
  const pct = ((value ?? 0) / (metric.max || 100)) * 100

  const trackStyle = {
    background: `linear-gradient(to right, var(--accent-primary) ${pct}%, var(--border) ${pct}%)`,
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <label
        style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 140, cursor: readOnly ? 'default' : 'pointer' }}
        title={metric.description}
      >
        {metric.label}
      </label>
      <div style={{ flex: 1, position: 'relative' }}>
        <input
          type="range"
          min={metric.min ?? 0}
          max={metric.max ?? 100}
          step={metric.max <= 10 ? 0.5 : 1}
          value={value ?? 0}
          disabled={readOnly}
          style={{ width: '100%', ...trackStyle }}
          onChange={(e) => onChange?.(metric.id, Number(e.target.value))}
        />
      </div>
      <span
        style={{
          fontFamily: 'JetBrains Mono',
          fontSize: 13,
          fontWeight: 700,
          minWidth: 32,
          textAlign: 'right',
          color: pct >= 70 ? 'var(--accent-primary)' : pct >= 40 ? 'var(--text-primary)' : 'var(--text-muted)',
        }}
      >
        {value != null ? (Number.isInteger(value) ? value : value.toFixed(1)) : '—'}
      </span>
    </div>
  )
}
