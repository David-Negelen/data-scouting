const BASE = '/api/fotmob'

const get = async (path) => {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`FotMob ${res.status}: ${path}`)
  return res.json()
}

export const searchPlayers = (name) =>
  get(`/data/search/suggest?hits=50&lang=en&term=${encodeURIComponent(name)}`)

export const getPlayerData = (id) =>
  get(`/playerData?id=${id}`)

// FotMob stats come as [{key, value, title}] — convert to plain object
const statsObj = (statsArr) =>
  Object.fromEntries((statsArr ?? []).map((s) => [s.key, s.value]))

// Extract season+tournament options from playerData for the dropdown
export const getSeasonOptions = (playerData) => {
  const options = []
  for (const season of playerData.statSeasons ?? []) {
    for (const t of season.tournaments ?? []) {
      options.push({
        label: `${season.seasonName} — ${t.leagueName ?? t.tournamentName ?? ''}`,
        seasonName: season.seasonName,
        stats: statsObj(t.stats),
      })
    }
  }
  return options
}

// Map FotMob stats object + appearances to a per-match-average match log entry
export const mapStatsToMatchLog = (stats, seasonLabel) => {
  const apps = stats.matches ?? stats.appearances ?? stats.matchesPlayed ?? 1
  const avg = (n) => (n != null && apps > 0) ? Math.round((n / apps) * 100) / 100 : undefined

  return {
    date: new Date().toISOString().split('T')[0],
    opponent: `Season avg (${seasonLabel})`,
    competition: 'FotMob Import',
    result: '',
    minutesPlayed: apps > 0 ? Math.round((stats.minutesPlayed ?? 90 * apps) / apps) : 90,
    goals:          avg(stats.goals),
    assists:        avg(stats.assists),
    keyPasses:      avg(stats.keyPasses ?? stats.keypasses),
    shotOnTarget:   avg(stats.shotsOnTarget ?? stats.onTargetScoringAttempt),
    shotOffTarget:  avg(stats.shotsOffTarget ?? stats.blockedScoringAttempt),
    interceptions:  avg(stats.interceptions),
    clearances:     avg(stats.clearances),
    duelsWon:       avg(stats.successfulDuels ?? stats.duelsWon),
    aerialsWon:     avg(stats.aerialDuelsWon ?? stats.wonContest),
    foulsCommitted: avg(stats.foulsCommitted ?? stats.fouls),
    foulsWon:       avg(stats.foulsWon ?? stats.wasFouled),
    xG:             avg(stats.xGoals ?? stats.expectedGoals ?? stats.xg),
    xA:             avg(stats.xAssists ?? stats.expectedAssists ?? stats.xa),
    distanceCovered: stats.distanceRan != null && apps > 0
      ? Math.round((stats.distanceRan / apps) * 10) / 10
      : undefined,
  }
}
