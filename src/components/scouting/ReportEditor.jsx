import { useState, useRef } from 'react'
import { useReportsStore } from '@/store'
import { RECOMMENDATION_COLORS } from '@/constants/metricDefinitions'

const RECOMMENDATIONS = ['Sign', 'Loan', 'Monitor', 'Pass']

const TEMPLATES = {
  Sign:    '<p>Player demonstrates exceptional quality and is ready to contribute at senior level. Recommend immediate signing.</p><p><strong>Strengths:</strong> </p><p><strong>Areas to develop:</strong> </p><p><strong>Fit:</strong> </p>',
  Loan:    '<p>Player has talent but needs regular senior football. A loan move would be beneficial.</p><p><strong>Loan purpose:</strong> </p><p><strong>Ideal destination:</strong> </p>',
  Monitor: '<p>Player shows promise. Continue monitoring over the next 6 months before making a decision.</p><p><strong>What to watch:</strong> </p>',
  Pass:    '<p>Does not meet current requirements. Not recommended for further scouting at this stage.</p><p><strong>Reasons:</strong> </p>',
}

export default function ReportEditor({ playerId, existingReport, onDone }) {
  const addReport = useReportsStore((s) => s.addReport)
  const updateReport = useReportsStore((s) => s.updateReport)

  const isEdit = Boolean(existingReport?.id)

  const [recommendation, setRecommendation] = useState(existingReport?.recommendation ?? 'Monitor')
  const [rating, setRating] = useState(existingReport?.overallRating ?? 7)
  const [matchDate, setMatchDate] = useState(existingReport?.matchDate ?? '')
  const [venue, setVenue] = useState(existingReport?.venue ?? '')
  const [competition, setCompetition] = useState(existingReport?.competition ?? '')
  const editorRef = useRef()

  const handleRec = (rec) => {
    setRecommendation(rec)
    if (!isEdit && editorRef.current && !editorRef.current.textContent.trim()) {
      editorRef.current.innerHTML = TEMPLATES[rec] ?? ''
    }
  }

  const handleSave = () => {
    const content = editorRef.current?.innerHTML ?? ''
    const payload = {
      playerId,
      recommendation,
      overallRating: rating,
      matchDate,
      venue,
      competition,
      content,
      date: new Date().toISOString(),
    }
    if (isEdit) {
      updateReport(existingReport.id, payload)
    } else {
      addReport(payload)
    }
    onDone?.()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Meta fields */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Match Date</span>
          <input className="input" type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Venue</span>
          <input className="input" placeholder="e.g. Allianz Arena" value={venue} onChange={(e) => setVenue(e.target.value)} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Competition</span>
          <input className="input" placeholder="e.g. Bundesliga" value={competition} onChange={(e) => setCompetition(e.target.value)} />
        </label>
      </div>

      {/* Recommendation */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Recommendation
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {RECOMMENDATIONS.map((rec) => {
            const color = RECOMMENDATION_COLORS[rec]
            const active = recommendation === rec
            return (
              <button
                key={rec}
                onClick={() => handleRec(rec)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 99,
                  border: `1px solid ${active ? color : 'var(--border)'}`,
                  background: active ? `${color}22` : 'transparent',
                  color: active ? color : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {rec}
              </button>
            )
          })}
        </div>
      </div>

      {/* Overall rating */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Overall Rating: <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-primary)' }}>{rating}/10</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={rating}
          style={{ width: 200 }}
          onChange={(e) => setRating(Number(e.target.value))}
        />
      </div>

      {/* Rich text editor */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Scouting Notes
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: existingReport?.content ?? TEMPLATES[recommendation] ?? '' }}
          style={{
            minHeight: 200,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '12px 14px',
            fontSize: 13,
            lineHeight: 1.6,
            outline: 'none',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-secondary)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {onDone && (
          <button className="btn btn-secondary" onClick={onDone}>
            Cancel
          </button>
        )}
        <button className="btn btn-primary" onClick={handleSave}>
          {isEdit ? 'Update Report' : 'Save Report'}
        </button>
      </div>
    </div>
  )
}
