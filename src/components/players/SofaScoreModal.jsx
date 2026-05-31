import { useState, useEffect } from 'react'
import { searchPlayers, getPlayerData, parseSeasonOptions, parseRecentMatches, mapSeasonToLog, mapMatchToLog } from '@/api/fotmob'
import { usePlayersStore } from '@/store'

export default function SofaScoreModal({ player, onClose }) {
  const addMatchLog  = usePlayersStore((s) => s.addMatchLog)
  const updatePlayer = usePlayersStore((s) => s.updatePlayer)

  const [step, setStep]             = useState('search')
  const [candidates, setCandidates] = useState([])
  const [selected, setSelected]     = useState(null)
  const [mode, setMode]             = useState('matches') // 'matches' | 'season'
  const [seasonOptions, setSeasonOptions] = useState([])
  const [seasonIdx, setSeasonIdx]   = useState(0)
  const [matches, setMatches]       = useState([])
  const [selectedMatches, setSelectedMatches] = useState(new Set())
  const [competitionFilter, setCompetitionFilter] = useState('All')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => { doSearch(player.name) }, []) // eslint-disable-line

  const doSearch = async (name) => {
    setLoading(true); setError('')
    try {
      const data = await searchPlayers(name)
      const groups = Array.isArray(data) ? data : []
      const group = groups.find((g) => g.title?.key === 'players') ?? groups[0]
      const hits = (group?.suggestions ?? []).filter((s) => s.type === 'player' && !s.isCoach).slice(0, 6)
      setCandidates(hits)
      if (!hits.length) setError('No players found on FotMob.')
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleSelect = async (candidate) => {
    setLoading(true); setError('')
    try {
      const data = await getPlayerData(candidate.id)
      const seasons = parseSeasonOptions(data)
      const recent  = parseRecentMatches(data)
      setSelected({ ...candidate, fotmobId: String(candidate.id) })
      setSeasonOptions(seasons)
      setSeasonIdx(0)
      setMatches(recent)
      const allIds = new Set(recent.map((_, i) => i))
      setSelectedMatches(allIds)
      setStep('import')
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const competitions = ['All', ...Array.from(new Set(matches.map((m) => m.leagueName)))]
  const visibleMatches = competitionFilter === 'All'
    ? matches
    : matches.filter((m) => m.leagueName === competitionFilter)

  const toggleMatch = (i) => {
    setSelectedMatches((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const toggleAll = () => {
    const visibleIds = new Set(visibleMatches.map((_, vi) => matches.indexOf(visibleMatches[vi])))
    const allSelected = [...visibleIds].every((i) => selectedMatches.has(i))
    setSelectedMatches((prev) => {
      const next = new Set(prev)
      visibleIds.forEach((i) => allSelected ? next.delete(i) : next.add(i))
      return next
    })
  }

  const handleImport = () => {
    if (mode === 'season') {
      const opt = seasonOptions[seasonIdx]
      if (!opt) return
      addMatchLog(player.id, mapSeasonToLog(opt))
    } else {
      const toImport = matches.filter((_, i) => selectedMatches.has(i))
      toImport.forEach((m) => addMatchLog(player.id, mapMatchToLog(m)))
    }
    updatePlayer(player.id, { fotmobId: selected.fotmobId })
    setStep('done')
  }

  const fmtDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* STEP: search */}
      {step === 'search' && (
        <>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Searching FotMob for <strong>{player.name}</strong>…
          </p>
          {loading && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading…</p>}
          {error   && <p style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</p>}
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

      {/* STEP: import */}
      {step === 'import' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, margin: 0 }}>
              <strong>{selected?.name}</strong>
              {selected?.teamName && <span style={{ color: 'var(--text-muted)' }}> · {selected.teamName}</span>}
            </p>
            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface)', borderRadius: 6, padding: 3 }}>
              {['matches', 'season'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    background: mode === m ? 'var(--accent-primary)' : 'transparent',
                    color: mode === m ? '#000' : 'var(--text-muted)',
                    border: 'none', borderRadius: 4, padding: '4px 10px',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
                  }}
                >
                  {m === 'matches' ? 'Match Logs' : 'Season Totals'}
                </button>
              ))}
            </div>
          </div>

          {mode === 'matches' && (
            <>
              {/* Competition filter */}
              {competitions.length > 2 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {competitions.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCompetitionFilter(c)}
                      style={{
                        fontSize: 11, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)',
                        background: competitionFilter === c ? 'var(--accent-primary)' : 'transparent',
                        color: competitionFilter === c ? '#000' : 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              {/* Match list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 320, overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', fontSize: 11, color: 'var(--text-muted)' }}>
                  <input
                    type="checkbox"
                    checked={visibleMatches.every((_, vi) => selectedMatches.has(matches.indexOf(visibleMatches[vi])))}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Select all ({visibleMatches.filter((_, vi) => selectedMatches.has(matches.indexOf(visibleMatches[vi]))).length}/{visibleMatches.length})</span>
                </div>
                {visibleMatches.map((m, vi) => {
                  const idx = matches.indexOf(m)
                  const checked = selectedMatches.has(idx)
                  return (
                    <label
                      key={idx}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px',
                        borderRadius: 6, cursor: 'pointer',
                        background: checked ? 'rgba(200,242,48,0.06)' : 'transparent',
                        border: `1px solid ${checked ? 'rgba(200,242,48,0.2)' : 'var(--border)'}`,
                      }}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleMatch(idx)} style={{ cursor: 'pointer' }} />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 52, flexShrink: 0 }}>
                        {fmtDate(m.matchDate?.utcTime)}
                      </span>
                      <span style={{ fontSize: 12, flex: 1, fontWeight: 600 }}>vs {m.opponentTeamName}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 60, flexShrink: 0 }}>{m.leagueName}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, width: 28, flexShrink: 0 }}>
                        {m.isHomeTeam ? `${m.homeScore}-${m.awayScore}` : `${m.awayScore}-${m.homeScore}`}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--accent-primary)', width: 40, flexShrink: 0 }}>
                        {m.goals > 0 && `G${m.goals}`}{m.goals > 0 && m.assists > 0 && ' '}{m.assists > 0 && `A${m.assists}`}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-muted)', width: 30, flexShrink: 0 }}>
                        {parseFloat(m.ratingProps?.rating) > 0 ? parseFloat(m.ratingProps.rating).toFixed(1) : ''}
                      </span>
                    </label>
                  )
                })}
              </div>
            </>
          )}

          {mode === 'season' && (
            <>
              {seasonOptions.length > 0 ? (
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Season / Competition
                  </span>
                  <select className="input" value={seasonIdx} onChange={(e) => setSeasonIdx(Number(e.target.value))}>
                    {seasonOptions.map((o, i) => (
                      <option key={i} value={i}>{o.label}</option>
                    ))}
                  </select>
                  {seasonOptions[seasonIdx] && (
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, marginTop: 4 }}>
                      {[
                        ['Apps',    seasonOptions[seasonIdx].appearances],
                        ['Goals',   seasonOptions[seasonIdx].goals],
                        ['Assists', seasonOptions[seasonIdx].assists],
                        ['Rating',  seasonOptions[seasonIdx].rating?.toFixed(2)],
                      ].filter(([, v]) => v != null).map(([label, value]) => (
                        <span key={label} style={{ color: 'var(--text-muted)' }}>
                          {label}: <strong style={{ color: 'var(--accent-primary)', fontFamily: 'JetBrains Mono' }}>{value}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </label>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No season history available.</p>
              )}
            </>
          )}

          {error && <p style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</p>}
          {loading && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading…</p>}
        </>
      )}

      {step === 'done' && (
        <p style={{ fontSize: 14, color: 'var(--success)' }}>
          Imported. Check the Match Logs tab.
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          {step === 'done' ? 'Close' : 'Cancel'}
        </button>
        {step === 'import' && (
          <button
            className="btn btn-primary"
            onClick={handleImport}
            disabled={loading || (mode === 'matches' && selectedMatches.size === 0)}
          >
            {mode === 'matches'
              ? `Import ${matches.filter((_, i) => selectedMatches.has(i)).length} matches`
              : 'Import Season Stats'}
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
