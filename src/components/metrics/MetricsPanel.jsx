import { useState } from 'react'
import MetricSlider from './MetricSlider'
import { METRICS, METRIC_CATEGORIES } from '@/constants/metricDefinitions'
import { isGK } from '@/constants/positions'
import { categoryScore } from '@/utils/metricsCalc'

const CATEGORIES = ['technical', 'physical', 'tactical', 'goalkeeping']

export default function MetricsPanel({ player, onMetricChange, readOnly = false }) {
  const [activeTab, setActiveTab] = useState('technical')
  const gk = isGK(player?.position)

  const tabs = gk
    ? ['goalkeeping', 'physical', 'tactical']
    : ['technical', 'physical', 'tactical']

  const metrics = player?.metrics ?? {}

  const catMetrics = METRICS.filter(
    (m) => m.category === activeTab && m.category !== 'matchStats',
  )

  const catScore = Math.round(categoryScore(metrics, activeTab))

  return (
    <div>
      <div className="tabs" style={{ marginBottom: 16 }}>
        {tabs.map((cat) => (
          <button
            key={cat}
            className={`tab ${activeTab === cat ? 'active' : ''}`}
            onClick={() => setActiveTab(cat)}
          >
            <span style={{ marginRight: 6 }}>{METRIC_CATEGORIES[cat]?.label}</span>
            <span
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: 11,
                color: METRIC_CATEGORIES[cat]?.color,
              }}
            >
              {Math.round(categoryScore(metrics, cat))}
            </span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div
          style={{
            fontFamily: 'Barlow Condensed',
            fontWeight: 700,
            fontSize: 13,
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {METRIC_CATEGORIES[activeTab]?.label} avg
        </div>
        <div
          style={{
            fontFamily: 'JetBrains Mono',
            fontWeight: 700,
            fontSize: 18,
            color: METRIC_CATEGORIES[activeTab]?.color,
          }}
        >
          {catScore}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {catMetrics.map((m) => (
          <MetricSlider
            key={m.id}
            metric={m}
            value={metrics[m.id] ?? 0}
            readOnly={readOnly}
            onChange={onMetricChange}
          />
        ))}
      </div>
    </div>
  )
}
