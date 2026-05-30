// Proxied through Vite dev server at /api/transfermarkt → https://transfermarkt-api.fly.dev
const BASE = '/api/transfermarkt'

const get = async (path) => {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Transfermarkt API ${res.status}: ${path}`)
  return res.json()
}

export const searchPlayers = (name) =>
  get(`/players/search/${encodeURIComponent(name)}`)

export const getPlayerProfile = (id) => get(`/players/${id}/profile`)

export const getPlayerStats = (id) => get(`/players/${id}/stats`)

export const getPlayerTransfers = (id) => get(`/players/${id}/transfers`)

export const getPlayerInjuries = (id) => get(`/players/${id}/injuries`)

// Map API response to our player schema subset
export const mapTMProfile = (profile) => ({
  name: profile.name,
  age: profile.age,
  nationality: profile.nationalities?.[0]?.name ?? '',
  nationalityCode: profile.nationalities?.[0]?.countryCode?.toLowerCase() ?? '',
  position: profile.position?.main ?? '',
  club: profile.club?.name ?? '',
  photo: profile.image ?? '',
  marketValue: profile.marketValue ?? '',
  contractUntil: profile.contractExpires ?? '',
  transfermarktId: String(profile.id),
})
