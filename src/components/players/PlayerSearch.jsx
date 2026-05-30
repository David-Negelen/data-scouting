import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchPlayers, mapTMProfile } from '@/api/transfermarkt'
import { fmtMarketValue } from '@/utils/formatters'

export default function PlayerSearch({ onSelect }) {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['tm-search', submitted],
    queryFn: () => searchPlayers(submitted),
    enabled: submitted.length >= 2,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const results = data?.players ?? data?.results ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="input"
          placeholder="Search Transfermarkt (e.g. Mbappé)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setSubmitted(query)}
        />
        <button className="btn btn-primary" onClick={() => setSubmitted(query)} disabled={query.length < 2}>
          Search
        </button>
      </div>

      {isLoading && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Searching…</p>}

      {error && (
        <div className="alert alert-warn">
          Transfermarkt API unavailable. Add player manually instead.
        </div>
      )}

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {results.slice(0, 8).map((r) => {
            const mapped = mapTMProfile(r)
            return (
              <div
                key={r.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  cursor: 'pointer',
                }}
                onClick={() => onSelect(mapped)}
              >
                {r.image && (
                  <img
                    src={r.image}
                    alt={r.name}
                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {mapped.position} · {mapped.club} · {mapped.age}y
                  </div>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--success)' }}>
                  {fmtMarketValue(mapped.marketValue)}
                </div>
                <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 10px' }}>
                  Add
                </button>
              </div>
            )
          })}
        </div>
      )}

      {submitted && !isLoading && !error && results.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No results for "{submitted}".</p>
      )}
    </div>
  )
}
