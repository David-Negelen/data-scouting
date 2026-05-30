import { useState } from 'react'
import { getCompetitionTeams } from '@/api/footballData'
import usePlayersStore from '@/store/playersSlice'
import { LEAGUES } from '@/constants/leagues'

// football-data.org competition codes for supported leagues
const FD_CODES = {
  'premier-league':   'PL',
  'bundesliga':       'BL1',
  'laliga':           'PD',
  'serie-a':          'SA',
  'ligue1':           'FL1',
  'eredivisie':       'DED',
  'primeira-liga':    'PPL',
  'champions-league': 'CL',
  'europa-league':    'EL',
}

function calcAge(dateOfBirth) {
  if (!dateOfBirth) return null
  return Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

export default function LeagueImportModal({ onClose }) {
  const players = usePlayersStore((s) => s.players)
  const importPlayers = usePlayersStore((s) => s.importPlayers)

  const [leagueId, setLeagueId] = useState('premier-league')
  const [status, setStatus] = useState(null) // null | 'loading' | 'done' | 'error'
  const [message, setMessage] = useState('')

  const supportedLeagues = LEAGUES.filter((l) => FD_CODES[l.id])

  const handleImport = async () => {
    setStatus('loading')
    setMessage('Fetching squads from football-data.org…')
    try {
      const data = await getCompetitionTeams(FD_CODES[leagueId])
      const teams = data.teams ?? []
      setMessage(`Found ${teams.length} teams, processing players…`)

      const existingNames = new Set(players.map((p) => p.name.toLowerCase()))
      const leagueObj = LEAGUES.find((l) => l.id === leagueId)
      const newPlayers = []

      for (const team of teams) {
        for (const member of team.squad ?? []) {
          const key = member.name.toLowerCase()
          if (existingNames.has(key)) continue
          existingNames.add(key)
          newPlayers.push({
            id: crypto.randomUUID(),
            name: member.name,
            age: calcAge(member.dateOfBirth),
            position: member.position ?? '',
            club: team.name,
            league: leagueId,
            nationality: member.nationality ?? '',
            status: 'Prospect',
            matchLogs: [],
            metrics: {},
            createdAt: new Date().toISOString(),
          })
        }
      }

      importPlayers([...players, ...newPlayers])
      setStatus('done')
      setMessage(`Imported ${newPlayers.length} players from ${leagueObj?.label ?? leagueId}.`)
    } catch (err) {
      setStatus('error')
      setMessage(err.message)
    }
  }

  const msgStyle = {
    padding: '10px 14px',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
    background: status === 'error' ? 'rgba(255,80,80,0.1)' : 'rgba(200,242,48,0.08)',
    color: status === 'error' ? '#ff6b6b' : 'var(--text-primary)',
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
          League
        </label>
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
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        Requires a <strong>football-data.org API key</strong> configured in Settings.
        Imports all squad members as Prospects. Players with names already in your database are skipped.
      </p>

      {message && <div style={msgStyle}>{status === 'loading' && '⏳ '}{message}</div>}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          {status === 'done' ? 'Close' : 'Cancel'}
        </button>
        {status !== 'done' && (
          <button
            className="btn btn-primary"
            onClick={handleImport}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Importing…' : 'Import League'}
          </button>
        )}
      </div>
    </div>
  )
}
