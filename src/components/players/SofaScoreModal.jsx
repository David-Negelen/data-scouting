import { useState, useEffect } from 'react'
import { searchPlayers, getPlayerSeasons, getPlayerSeasonStats, mapSeasonToMatchLog, mapSeasonToMetrics } from '@/api/sofascore'
import { usePlayersStore } from '@/store'

export default function SofaScoreModal({ player, onClose }) {
  const addMatchLog = usePlayersStore((s) => s.addMatchLog)
  const updatePlayer = usePlayersStore((s) => s.updatePlayer)

  const [step, setStep] = useState('search')   // search | seasons | done
  const [candidates, setCandidates] = useState([])
  const [selected, setSelected]     = useState(null)
  const [seasons, setSeasons]       = useState([])
  const [seasonId, setSeasonId]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  // Auto-search on open
  useEffect(() => {
    doSearch(player.name)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const doSearch = async (name) => {
    setLoading(true)
    setError('')
    try {
      const data = await searchPlayers(name)
      const players = (data.results ?? [])
        .filter((r) => r.type === 'player')
        .slice(0, 6)
        .map((r) => r.entity ?? r)
      setCandidates(players)
      if (!players.length) setError('No players found on SofaScore. Try editing the name.')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = async (candidate) => {
    setSelected(candidate)
    setLoading(true)
    setError('')
    try {
      const data = await getPlayerSeasons(candidate.id)
      const list = data.seasons ?? data.uniqueTournamentSeasons ?? []
      setSeasons(list)
      setSeasonId(list[0]?.season?.id?.toString() ?? '')
      setStep('seasons')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    setLoading(true)
    setError('')
    try {
      const season = seasons.find((s) => String(s.season?.id) === seasonId)
      const data = await getPlayerSeasonStats(selected.id, seasonId)
      const stats = data.statistics ?? data

      const seasonLabel = season?.season?.year ?? season?.season?.name ?? seasonId
      const log = mapSeasonToMatchLog(stats, seasonLabel)
      const metricUpdates = mapSeasonToMetrics(stats)

      addMatchLog(player.id, log)
      if (Object.keys(metricUpdates).length) {
        updatePlayer(player.id, {
          metrics: { ...player.metrics, ...metricUpdates },
          sofaScoreId: String(selected.id),
        })
      } else {
        updatePlayer(player.id, { sofaScoreId: String(selected.id) })
      }

      setStep('done')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {step === 'search' && (
        <>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Searching SofaScore for <strong>{player.name}</strong>…
          </p>
          {loading && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading…</p>}
          {error && <p style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</p>}
          {!loading && candidates.map((c) => (
            <button
              key={c.id}
              className="btn btn-secondary"
              style={{ textAlign: 'left', display: 'flex', gap: 12, alignItems: 'center' }}
              onClick={() => handleSelect(c)}
            >
              {c.team?.name || c.country?.name ? (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 120 }}>
                  {c.team?.name ?? ''} · {c.position ?? ''}
                </span>
              ) : null}
              <span style={{ fontWeight: 600 }}>{c.name}</span>
            </button>
          ))}
          {!loading && !candidates.length && !error && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No results.</p>
          )}
        </>
      )}

      {step === 'seasons' && selected && (
        <>
          <p style={{ fontSize: 13 }}>
            Selected: <strong>{selected.name}</strong>
            {selected.team?.name && <span style={{ color: 'var(--text-muted)' }}> · {selected.team.name}</span>}
          </p>
          {seasons.length > 0 ? (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Season</span>
              <select
                className="input"
                value={seasonId}
                onChange={(e) => setSeasonId(e.target.value)}
                disabled={loading}
              >
                {seasons.map((s) => (
                  <option key={s.season?.id} value={s.season?.id}>
                    {s.season?.year ?? s.season?.name} — {s.tournament?.name ?? s.uniqueTournament?.name ?? ''}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No season stats found for this player.</p>
          )}
          {error && <p style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</p>}
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Imports season totals as per-match averages into Match Logs.
            Pass accuracy and dribble success are also mapped to Technical metrics.
          </p>
        </>
      )}

      {step === 'done' && (
        <p style={{ fontSize: 14, color: 'var(--success)' }}>
          Stats imported successfully. Check Match Logs for the new entry.
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          {step === 'done' ? 'Close' : 'Cancel'}
        </button>
        {step === 'seasons' && seasons.length > 0 && step !== 'done' && (
          <button className="btn btn-primary" onClick={handleImport} disabled={loading || !seasonId}>
            {loading ? 'Importing…' : 'Import Stats'}
          </button>
        )}
        {step === 'search' && !loading && (
          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => doSearch(player.name)}>
            Retry
          </button>
        )}
      </div>
    </div>
  )
}
