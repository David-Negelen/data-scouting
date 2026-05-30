// API-Football via RapidAPI free tier (100 req/day).
// User enters their RapidAPI key in Settings.
const BASE = 'https://api-football-v1.p.rapidapi.com/v3'

const getKey = () => {
  try {
    return JSON.parse(localStorage.getItem('scout-settings') ?? '{}').rapidApiKey ?? ''
  } catch {
    return ''
  }
}

const get = async (path) => {
  const key = getKey()
  if (!key) throw new Error('RapidAPI key not configured (add it in Settings)')
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'X-RapidAPI-Key': key,
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
    },
  })
  if (!res.ok) throw new Error(`api-football ${res.status}: ${path}`)
  const json = await res.json()
  return json.response ?? json
}

export const getPlayerStats = (playerId, season) =>
  get(`/players?id=${playerId}&season=${season ?? new Date().getFullYear() - 1}`)

export const getTeamSquad = (teamId) => get(`/players/squads?team=${teamId}`)

export const getFixtures = (teamId, season) =>
  get(`/fixtures?team=${teamId}&season=${season ?? new Date().getFullYear() - 1}`)

export const searchPlayer = (name) => get(`/players?search=${encodeURIComponent(name)}`)
