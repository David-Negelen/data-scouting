const BASE = '/api/soccerdata'

const get = (path) =>
  fetch(`${BASE}${path}`).then((r) => {
    if (!r.ok) return r.text().then((t) => { throw new Error(t || `soccerdata ${r.status}`) })
    return r.json()
  })

export const getLeagues = () => get('/leagues')
export const getSeasons = () => get('/seasons')

// Returns array of player objects for a full league/season.
// First call scrapes FBref and caches to disk (~10-30s); subsequent calls are instant.
export const getPlayers = (leagueId, season) => get(`/players/${leagueId}/${season}`)
