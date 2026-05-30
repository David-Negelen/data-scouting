import { printReport } from '@/utils/exportPDF'
import { fmtDate } from '@/utils/formatters'
import { RECOMMENDATION_COLORS } from '@/constants/metricDefinitions'

export default function ReportPrint({ player, report }) {
  const recColor = RECOMMENDATION_COLORS[report?.recommendation] ?? '#888'

  return (
    <div>
      <div className="no-print" style={{ marginBottom: 12 }}>
        <button className="btn btn-secondary" onClick={printReport}>
          🖨️ Print / Save PDF
        </button>
      </div>

      <div id="print-area" style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 28 }}>Scouting Report</h1>
            <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: 22, color: 'var(--accent-primary)', marginTop: 2 }}>
              {player?.name}
            </h2>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {player?.position} · {player?.club} · {player?.age}y
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {report?.recommendation && (
              <span
                className="badge"
                style={{
                  background: `${recColor}22`,
                  color: recColor,
                  fontSize: 14,
                  padding: '4px 16px',
                }}
              >
                {report.recommendation}
              </span>
            )}
            {report?.overallRating && (
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 24, fontWeight: 700, color: 'var(--accent-primary)', marginTop: 8 }}>
                {report.overallRating}/10
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginBottom: 20,
            fontSize: 12,
          }}
        >
          {[
            ['Date Observed', report?.matchDate ? fmtDate(report.matchDate) : '—'],
            ['Venue', report?.venue || '—'],
            ['Competition', report?.competition || '—'],
            ['Contract Until', player?.contractUntil || '—'],
            ['Market Value', player?.marketValue || '—'],
            ['Report Date', fmtDate(report?.createdAt)],
          ].map(([label, val]) => (
            <div key={label} style={{ borderLeft: '2px solid var(--border)', paddingLeft: 10 }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontWeight: 600 }}>{val}</div>
            </div>
          ))}
        </div>

        <div className="divider" />

        <div
          style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)' }}
          dangerouslySetInnerHTML={{ __html: report?.content ?? '' }}
        />

        <div
          style={{
            marginTop: 32,
            paddingTop: 16,
            borderTop: '1px solid var(--border)',
            fontSize: 11,
            color: 'var(--text-muted)',
          }}
        >
          Soccer Scout Analytics — Confidential
        </div>
      </div>
    </div>
  )
}
