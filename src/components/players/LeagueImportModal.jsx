import { useState } from 'react'
import { getPlayers } from '@/api/soccerdata'
import usePlayersStore from '@/store/playersSlice'
import { LEAGUES } from '@/constants/leagues'

const FBREF_IDS = new Set([
  'premier-league', 'championship',
  'bundesliga', 'bundesliga2',
  'laliga', 'laliga2',
  'serie-a', 'serie-b',
  'ligue1', 'ligue2',
  'eredivisie', 'primeira-liga',
  'pro-league', 'super-lig',
  'champions-league', 'europa-league',
  'mls',
])

const SEASONS = [
  { id: '2425', label: '2024/25' },
  { id: '2324', label: '2023/24' },
  { id: '2223', label: '2022/23' },
  { id: '2122', label: '2021/22' },
  { id: '2024', label: '2024 (MLS/calendar)' },
]

function toMatchLog(p, season) {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split('T')[0],
    opponent: `Season ${season}`,
    competition: 'FBref',
    isSeason: true,
    minutesPlayed: p.minutesPlayed ?? undefined,
    goals:         p.goals       || undefined,
    assists:       p.assists     || undefined,
    xG:            p.xG         || undefined,
    xA:            p.xA         || undefined,
    yellowCards:   p.yellowCards || undefined,
    redCards:      p.redCards   || undefined,
  }
}

export default function LeagueImportModal({ onClose }) {
  const players       = usePlayersStore((s) => s.players)
  const importPlayers = usePlayersStore((s) => s.importPlayers)

  const [leagueId, setLeagueId] = useState('premier-league')
  const [season, setSeason]     = useState('2425')
  const [status, setStatus]     = useState(null) // null | 'loading' | 'done' | 'error'
  const [message, setMessage]   = useState('')

  const supportedLeagues = LEAGUES.filter((l) => FBREF_IDS.has(l.id))

  const handleImport = async () => {
    setStatus('loading')
    setMessage('Fetching from FBref… first call may take 10-30s while data is downloaded and cached.')
    try {
      const fetched = await getPlayers(leagueId, season)
      const leagueObj = LEAGUES.find((l) => l.id === leagueId)
      const existingNames = new Set(players.map((p) => p.name.toLowerCase()))

      const newPlayers = fetched
        .filter((p) => p.name && !existingNames.has(p.name.toLowerCase()))
        .map((p) => ({
          id:          crypto.randomUUID(),
          name:        p.name,
          age:         p.age != null ? parseInt(p.age) : undefined,
          position:    p.position ?? '',
          club:        p.team ?? '',
          league:      leagueId,
          nationality: p.nationality ?? '',
          status:      'Prospect',
          matchLogs:   p.minutesPlayed ? [toMatchLog(p, season)] : [],
          metrics:     {},
          createdAt:   new Date().toISOString(),
        }))

      importPlayers([...players, ...newPlayers])
      setStatus('done')
      setMessage(`Imported ${newPlayers.length} new players from ${leagueObj?.label ?? leagueId} ${season}.`)
    } catch (err) {
      setStatus('error')
      setMessage(err.message)
    }
  }

  const msgStyle = {
    padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13,
    background: status === 'error' ? 'rgba(255,80,80,0.1)' : 'rgba(200,242,48,0.08)',
    color: status === 'error' ? '#ff6b6b' : 'var(--text-primary)',
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <label style={{ flex: 1 }}>
          <span style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>League</span>
          <select
            className="input"
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            disabled={status === 'loading'}
            style={{ width: '100%' }}
          >
            {supportedLeagues.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </label>
        <label style={{ width: 140 }}>
          <span style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Season</span>
          <select
            className="input"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            disabled={status === 'loading'}
            style={{ width: '100%' }}
          >
            {SEASONS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        Pulls all players from <strong>FBref</strong> via soccerdata. Includes season totals (goals, assists, xG, minutes).
        Data is cached locally after the first fetch.
      </p>

      {message && <div style={msgStyle}>{status === 'loading' && '⏳ '}{message}</div>}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          {status === 'done' ? 'Close' : 'Cancel'}
        </button>
        {status !== 'done' && (
          <button className="btn btn-primary" onClick={handleImport} disabled={status === 'loading'}>
            {status === 'loading' ? 'Fetching…' : 'Import League'}
          </button>
        )}
      </div>
    </div>
  )
}
