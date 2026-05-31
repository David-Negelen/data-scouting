const BASE = '/api/sofascore'

const get = async (path) => {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`SofaScore ${res.status}: ${path}`)
  return res.json()
}

export const searchPlayers = (name) =>
  get(`/search/all?q=${encodeURIComponent(name)}&page=0`)

export const getPlayerSeasons = (playerId) =>
  get(`/player/${playerId}/statistics/seasons`)

export const getPlayerSeasonStats = (playerId, seasonId) =>
  get(`/player/${playerId}/statistics/season/${seasonId}/accumulation/total`)

// Map season totals to a per-match-average match log entry
export const mapSeasonToMatchLog = (stats, seasonLabel) => {
  const apps = stats.appearances ?? stats.matchesPlayed ?? 1
  const avg = (n) => (n != null && apps > 0) ? Math.round((n / apps) * 100) / 100 : undefined

  return {
    date: new Date().toISOString().split('T')[0],
    opponent: `Season avg (${seasonLabel})`,
    competition: 'SofaScore Import',
    result: '',
    minutesPlayed: apps > 0 ? Math.round((stats.minutesPlayed ?? 90 * apps) / apps) : 90,
    goals:           avg(stats.goals),
    assists:         avg(stats.assists),
    keyPasses:       avg(stats.keyPasses),
    shotOnTarget:    avg(stats.shotsOnTarget),
    shotOffTarget:   avg(stats.shotsOffTarget),
    interceptions:   avg(stats.interceptions),
    clearances:      avg(stats.clearances),
    duelsWon:        avg(stats.totalDuelsWon ?? stats.duelsWon),
    duelsLost:       avg(stats.totalDuelsLost ?? stats.duelsLost),
    aerialsWon:      avg(stats.aerialDuelsWon),
    aerialsLost:     avg(stats.aerialDuelsLost),
    foulsCommitted:  avg(stats.foulsCommitted),
    foulsWon:        avg(stats.foulsDrawn ?? stats.foulsWon),
    xG:              avg(stats.expectedGoals ?? stats.xg),
    xA:              avg(stats.expectedAssists ?? stats.xa),
    distanceCovered: stats.distanceRan != null && apps > 0
      ? Math.round((stats.distanceRan / apps) * 10) / 10
      : undefined,
  }
}

// Returns metric updates (0-100) derivable from season percentage stats
export const mapSeasonToMetrics = (stats) => {
  const out = {}
  if (stats.accuratePassesPercentage != null)
    out.shortPassing = Math.min(100, Math.round(stats.accuratePassesPercentage))
  if (stats.successfulDribbles != null && (stats.totalDribbles ?? 0) > 0)
    out.dribbling = Math.min(100, Math.round((stats.successfulDribbles / stats.totalDribbles) * 100))
  return out
}
