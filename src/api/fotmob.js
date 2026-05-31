import { log, logError } from '@/utils/logger'

const BASE = '/api/fotmob'

const get = async (path) => {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`FotMob ${res.status}: ${path}`)
  return res.json()
}

export const searchPlayers = (name) =>
  get(`/data/search/suggest?hits=50&lang=en&term=${encodeURIComponent(name)}`)

export const getPlayerData = async (id) => {
  const data = await get(`/data/playerData?id=${id}`)
  log('[FotMob] playerData keys', Object.keys(data))
  return data
}

// Season totals per competition from careerHistory
export const parseSeasonOptions = (playerData) => {
  const entries = playerData?.careerHistory?.careerItems?.senior?.seasonEntries ?? []
  const options = []
  for (const season of entries) {
    for (const t of season.tournamentStats ?? []) {
      if (t.isFriendly) continue
      options.push({
        label: `${t.seasonName} — ${t.leagueName}`,
        seasonName: t.seasonName,
        leagueName: t.leagueName,
        appearances: Number(t.appearances) || 0,
        goals: Number(t.goals) || 0,
        assists: Number(t.assists) || 0,
        rating: parseFloat(t.rating?.rating) || null,
      })
    }
  }
  return options
}

// Individual match entries from recentMatches
export const parseRecentMatches = (playerData) =>
  (playerData?.recentMatches ?? []).filter((m) => !m.onBench && m.minutesPlayed > 0)

export const mapSeasonToLog = (opt) => ({
  date: new Date().toISOString().split('T')[0],
  opponent: `${opt.seasonName} — ${opt.leagueName}`,
  competition: 'FotMob Import',
  isSeason: true,
  apps: opt.appearances,
  totalMinutes: opt.appearances * 90,
  result: '',
  goals: opt.goals || undefined,
  assists: opt.assists || undefined,
  rating: opt.rating || undefined,
})

export const mapMatchToLog = (m) => ({
  date: m.matchDate?.utcTime?.split('T')[0] ?? new Date().toISOString().split('T')[0],
  opponent: m.opponentTeamName,
  competition: m.leagueName,
  result: m.isHomeTeam
    ? `${m.homeScore}-${m.awayScore}`
    : `${m.awayScore}-${m.homeScore}`,
  minutesPlayed: m.minutesPlayed,
  goals: m.goals || undefined,
  assists: m.assists || undefined,
  rating: parseFloat(m.ratingProps?.rating) || undefined,
  yellowCards: m.yellowCards || undefined,
  redCards: m.redCards || undefined,
})
