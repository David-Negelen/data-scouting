import { useState } from 'react'
import { useReportsStore } from '@/store'
import ReportEditor from './ReportEditor'
import { fmtDate, fmtRelative } from '@/utils/formatters'
import { RECOMMENDATION_COLORS } from '@/constants/metricDefinitions'

function ReportCard({ report, onDelete }) {
  const [editing, setEditing] = useState(false)
  const color = RECOMMENDATION_COLORS[report.recommendation] ?? 'var(--text-muted)'

  if (editing) {
    return (
      <div className="card" style={{ padding: 20 }}>
        <ReportEditor playerId={report.playerId} existingReport={report} onDone={() => setEditing(false)} />
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span
            className="badge"
            style={{ background: `${color}22`, color }}
          >
            {report.recommendation}
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--accent-primary)',
            }}
          >
            {report.overallRating}/10
          </span>
          {report.matchDate && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {fmtDate(report.matchDate)}
            </span>
          )}
          {report.competition && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {report.competition}</span>
          )}
          {report.venue && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>@ {report.venue}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setEditing(true)}>
            Edit
          </button>
          <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 12, color: 'var(--danger)' }} onClick={() => onDelete(report.id)}>
            Delete
          </button>
        </div>
      </div>
      <div
        style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text-primary)' }}
        dangerouslySetInnerHTML={{ __html: report.content }}
      />
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
        {fmtRelative(report.createdAt)}
      </div>
    </div>
  )
}

export default function ScoutingReport({ playerId }) {
  const reports = useReportsStore((s) => s.reports.filter((r) => r.playerId === playerId))
  const deleteReport = useReportsStore((s) => s.deleteReport)
  const [addingNew, setAddingNew] = useState(false)

  const sorted = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => setAddingNew(true)} disabled={addingNew}>
          + New Report
        </button>
      </div>

      {addingNew && (
        <div className="card" style={{ padding: 20 }}>
          <ReportEditor playerId={playerId} onDone={() => setAddingNew(false)} />
        </div>
      )}

      {sorted.length === 0 && !addingNew && (
        <div className="empty-state">
          <p>No scouting reports yet.</p>
          <button className="btn btn-secondary" onClick={() => setAddingNew(true)}>
            Write first report
          </button>
        </div>
      )}

      {sorted.map((r) => (
        <ReportCard key={r.id} report={r} onDelete={deleteReport} />
      ))}
    </div>
  )
}
