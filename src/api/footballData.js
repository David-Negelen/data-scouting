// football-data.org — free tier requires an API key.
// User enters it in Settings; it's stored in localStorage under 'scout-settings'.
const BASE = '/api/football-data'

const getKey = () => {
  try {
    return JSON.parse(localStorage.getItem('scout-settings') ?? '{}').footballDataKey ?? ''
  } catch {
    return ''
  }
}

const get = async (path) => {
  const key = getKey()
  if (!key) throw new Error('football-data.org API key not configured (add it in Settings)')
  const res = await fetch(`${BASE}${path}`, { headers: { 'X-Auth-Token': key } })
  if (!res.ok) throw new Error(`football-data.org ${res.status}: ${path}`)
  return res.json()
}

export const getCompetitionMatches = (code, season) =>
  get(`/competitions/${code}/matches?season=${season ?? new Date().getFullYear() - 1}`)

export const getTeamSquad = (teamId) => get(`/teams/${teamId}`)

export const getCompetitionStandings = (code) => get(`/competitions/${code}/standings`)

export const getCompetitionTeams = (code) => get(`/competitions/${code}/teams`)
