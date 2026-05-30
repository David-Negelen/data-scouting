import { useState } from 'react'
import { POSITIONS } from '@/constants/positions'
import { LEAGUES } from '@/constants/leagues'
import { PLAYER_STATUSES } from '@/constants/metricDefinitions'

const FIELD = (label, id, type = 'text', opts) => ({ label, id, type, ...opts })

const FIELDS = [
  FIELD('Full Name',        'name'),
  FIELD('Age',              'age',           'number', { min: 14, max: 45 }),
  FIELD('Nationality',      'nationality'),
  FIELD('Nationality Code', 'nationalityCode', 'text', { placeholder: 'e.g. de, fr, gb-eng' }),
  FIELD('Position',         'position',      'select', { options: POSITIONS.map((p) => ({ value: p.id, label: `${p.id} – ${p.label}` })) }),
  FIELD('Club',             'club'),
  FIELD('League',           'league',        'select', { options: LEAGUES.map((l) => ({ value: l.id, label: l.label })) }),
  FIELD('Contract Until',   'contractUntil', 'month'),
  FIELD('Market Value',     'marketValue',   'text',   { placeholder: 'e.g. 15000000' }),
  FIELD('Status',           'status',        'select', { options: PLAYER_STATUSES.map((s) => ({ value: s, label: s })) }),
  FIELD('Photo URL',        'photo',         'url',    { placeholder: 'https://…' }),
  FIELD('Transfermarkt ID', 'transfermarktId'),
]

export default function PlayerForm({ initialValues = {}, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    name: '',
    age: '',
    nationality: '',
    nationalityCode: '',
    position: 'CM',
    club: '',
    league: '',
    contractUntil: '',
    marketValue: '',
    status: 'Prospect',
    photo: '',
    transfermarktId: '',
    ...initialValues,
  })

  const set = (id, val) => setValues((v) => ({ ...v, [id]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const cleaned = {
      ...values,
      age: values.age !== '' ? Number(values.age) : undefined,
    }
    onSubmit(cleaned)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
        }}
      >
        {FIELDS.map(({ label, id, type, options, placeholder, min, max }) => (
          <label key={id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {label}
            </span>
            {type === 'select' ? (
              <select className="input" value={values[id] ?? ''} onChange={(e) => set(id, e.target.value)}>
                <option value="">— select —</option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <input
                className="input"
                type={type}
                value={values[id] ?? ''}
                placeholder={placeholder}
                min={min}
                max={max}
                onChange={(e) => set(id, e.target.value)}
              />
            )}
          </label>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {initialValues.id ? 'Save Changes' : 'Add Player'}
        </button>
      </div>
    </form>
  )
}
