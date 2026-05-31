import { useState, useEffect } from 'react'
import { searchPlayers, getPlayerData, getSeasonOptions, mapStatsToMatchLog } from '@/api/fotmob'
import { usePlayersStore } from '@/store'

export default function SofaScoreModal({ player, onClose }) {
  const addMatchLog  = usePlayersStore((s) => s.addMatchLog)
  const updatePlayer = usePlayersStore((s) => s.updatePlayer)

  const [step, setCandidates_step] = useState('search')  // search | seasons | done
  const [candidates, setCandidates] = useState([])
  const [selected, setSelected]     = useState(null)
  const [options, setOptions]       = useState([])        // season+tournament combos
  const [optionIdx, setOptionIdx]   = useState(0)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const setStep = setCandidates_step  // alias for clarity

  useEffect(() => { doSearch(player.name) }, []) // eslint-disable-line

  const doSearch = async (name) => {
    setLoading(true)
    setError('')
    try {
      const data = await searchPlayers(name)
      // Response is [{title:{key}, suggestions:[]}] — use the 'players' group
      const groups = Array.isArray(data) ? data : []
      const group = groups.find((g) => g.title?.key === 'players') ?? groups[0]
      const hits = (group?.suggestions ?? [])
        .filter((s) => s.type === 'player' && !s.isCoach)
        .slice(0, 6)
      setCandidates(hits)
      if (!hits.length) setError('No players found on FotMob.')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = async (candidate) => {
    setLoading(true)
    setError('')
    try {
      const data = await getPlayerData(candidate.id)
      const opts = getSeasonOptions(data)
      setSelected({ ...candidate, fotmobId: String(candidate.id) })
      setOptions(opts)
      setOptionIdx(0)
      setStep('seasons')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = () => {
    const opt = options[optionIdx]
    if (!opt) return
    const log = mapStatsToMatchLog(opt.stats, opt.seasonName)
    addMatchLog(player.id, log)
    updatePlayer(player.id, { fotmobId: selected.fotmobId })
    setStep('done')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {step === 'search' && (
        <>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Searching FotMob for <strong>{player.name}</strong>…
          </p>
          {loading && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading…</p>}
          {error  && <p style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</p>}
          {!loading && candidates.map((c) => (
            <button
              key={c.id}
              className="btn btn-secondary"
              style={{ textAlign: 'left', display: 'flex', gap: 12, alignItems: 'center' }}
              onClick={() => handleSelect(c)}
            >
              <span style={{ fontWeight: 600, flex: 1 }}>{c.name ?? c.playerName}</span>
              {(c.teamName || c.leagueName) && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {[c.teamName, c.leagueName].filter(Boolean).join(' · ')}
                </span>
              )}
            </button>
          ))}
        </>
      )}

      {step === 'seasons' && (
        <>
          <p style={{ fontSize: 13 }}>
            <strong>{selected?.name ?? selected?.playerName}</strong>
            {selected?.teamName && <span style={{ color: 'var(--text-muted)' }}> · {selected.teamName}</span>}
          </p>
          {options.length > 0 ? (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Season / Competition
              </span>
              <select
                className="input"
                value={optionIdx}
                onChange={(e) => setOptionIdx(Number(e.target.value))}
              >
                {options.map((o, i) => (
                  <option key={i} value={i}>{o.label}</option>
                ))}
              </select>
            </label>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No season stats available for this player.</p>
          )}
          {error && <p style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</p>}
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Season totals are divided by appearances to produce per-match averages, saved as a Match Log entry.
          </p>
        </>
      )}

      {step === 'done' && (
        <p style={{ fontSize: 14, color: 'var(--success)' }}>
          Stats imported. Check the Match Logs tab for the new entry.
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          {step === 'done' ? 'Close' : 'Cancel'}
        </button>
        {step === 'seasons' && options.length > 0 && (
          <button className="btn btn-primary" onClick={handleImport}>
            Import Stats
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
