import { useState } from 'react'
import { getPlayers } from '@/api/soccerdata'
import { usePlayersStore } from '@/store'
import { LEAGUES } from '@/constants/leagues'

const FBREF_IDS = [
  'premier-league', 'championship',
  'bundesliga', 'bundesliga2',
  'laliga', 'laliga2',
  'serie-a', 'serie-b',
  'ligue1', 'ligue2',
  'eredivisie', 'primeira-liga',
  'pro-league', 'super-lig',
  'champions-league', 'europa-league',
  'mls',
]

const SEASONS = [
  { id: '2425', label: '2024/25' },
  { id: '2324', label: '2023/24' },
  { id: '2223', label: '2022/23' },
  { id: '2122', label: '2021/22' },
  { id: '2024', label: '2024 (MLS/calendar)' },
]

const normalize = (s) => (s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

export default function SofaScoreModal({ player, onClose }) {
  const addMatchLog  = usePlayersStore((s) => s.addMatchLog)
  const updatePlayer = usePlayersStore((s) => s.updatePlayer)

  const defaultLeague = FBREF_IDS.includes(player.league) ? player.league : 'premier-league'

  const [leagueId, setLeagueId] = useState(defaultLeague)
  const [season, setSeason]     = useState('2425')
  const [step, setStep]         = useState('config') // 'config' | 'loading' | 'confirm' | 'done'
  const [found, setFound]       = useState(null)
  const [error, setError]       = useState('')

  const supportedLeagues = LEAGUES.filter((l) => FBREF_IDS.includes(l.id))

  const handleFetch = async () => {
    setStep('loading')
    setError('')
    try {
      const all = await getPlayers(leagueId, season)
      const target = normalize(player.name)
      const match =
        all.find((p) => normalize(p.name) === target) ??
        all.find((p) => {
          const pn = normalize(p.name)
          return pn.includes(target) || target.includes(pn)
        })

      if (!match) {
        setError(`"${player.name}" not found in FBref data for this league/season. Try a different league or season.`)
        setStep('config')
        return
      }
      setFound(match)
      setStep('confirm')
    } catch (e) {
      setError(e.message)
      setStep('config')
    }
  }

  const handleImport = () => {
    addMatchLog(player.id, {
      id:            crypto.randomUUID(),
      date:          new Date().toISOString().split('T')[0],
      opponent:      `Season ${season}`,
      competition:   'FBref',
      isSeason:      true,
      minutesPlayed: found.minutesPlayed ?? undefined,
      goals:         found.goals       || undefined,
      assists:       found.assists     || undefined,
      xG:            found.xG         || undefined,
      xA:            found.xA         || undefined,
      yellowCards:   found.yellowCards || undefined,
      redCards:      found.redCards   || undefined,
    })
    if (found.team) updatePlayer(player.id, { club: found.team })
    setStep('done')
  }

  const Stat = ({ label, value }) =>
    value != null ? (
      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
        {label}:{' '}
        <strong style={{ color: 'var(--accent-primary)', fontFamily: 'JetBrains Mono' }}>{value}</strong>
      </span>
    ) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {step === 'config' && (
        <>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Fetch season stats for <strong>{player.name}</strong> from FBref.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>League</span>
              <select className="input" value={leagueId} onChange={(e) => setLeagueId(e.target.value)} style={{ width: '100%' }}>
                {supportedLeagues.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </label>
            <label style={{ width: 130 }}>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Season</span>
              <select className="input" value={season} onChange={(e) => setSeason(e.target.value)} style={{ width: '100%' }}>
                {SEASONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
          {error && <p style={{ fontSize: 13, color: 'var(--danger)', margin: 0 }}>{error}</p>}
        </>
      )}

      {step === 'loading' && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Fetching from FBref… first call may take 10-30s while data is downloaded and cached.
        </p>
      )}

      {step === 'confirm' && found && (
        <>
          <p style={{ fontSize: 13, margin: 0 }}>
            Found: <strong>{found.name}</strong>
            {found.team && <span style={{ color: 'var(--text-muted)' }}> · {found.team}</span>}
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Stat label="Apps"    value={found.matchesPlayed} />
            <Stat label="Min"     value={found.minutesPlayed} />
            <Stat label="Goals"   value={found.goals} />
            <Stat label="Assists" value={found.assists} />
            <Stat label="xG"      value={found.xG} />
            <Stat label="xA"      value={found.xA} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Will be added as a season-total match log entry.
          </p>
        </>
      )}

      {step === 'done' && (
        <p style={{ fontSize: 14, color: 'var(--success)' }}>Imported. Check the Match Logs tab.</p>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          {step === 'done' ? 'Close' : 'Cancel'}
        </button>
        {step === 'config' && (
          <button className="btn btn-primary" onClick={handleFetch}>
            Fetch from FBref
          </button>
        )}
        {step === 'confirm' && (
          <button className="btn btn-primary" onClick={handleImport}>
            Import
          </button>
        )}
      </div>
    </div>
  )
}
