const BASE = '/api/fotmob'

const get = async (path) => {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`FotMob ${res.status}: ${path}`)
  return res.json()
}

export const searchPlayers = (name) =>
  get(`/data/search/suggest?hits=50&lang=en&term=${encodeURIComponent(name)}`)

// GET /api/players?id={id} — player profile + career seasons
export const getPlayerProfile = (id) =>
  get(`/players?id=${id}`)

// GET /api/playerStats?playerId={id}&seasonId={year}-{compIdx}&isFirstSeason=false
export const getPlayerStats = (playerId, seasonId, isFirstSeason = false) =>
  get(`/playerStats?playerId=${playerId}&seasonId=${encodeURIComponent(seasonId)}&isFirstSeason=${isFirstSeason}`)

// Extract season+competition options from /api/players profile data
// Returns [{label, playerId, seasonId, isFirstSeason}] for the dropdown
export const getSeasonOptions = (profile) => {
  const options = []
  const career = profile?.careerHistory?.careerItems?.clubCareer ?? []
  career.forEach((club, _ci) => {
    ;(club.seasons ?? []).forEach((season, si) => {
      ;(season.leagueStats ?? [season]).forEach((_ls, li) => {
        if (season.seasonId != null) {
          options.push({
            label: `${season.seasonName ?? season.season} — ${club.name ?? ''}`,
            playerId: profile?.id,
            seasonId: season.seasonId,
            isFirstSeason: si === 0 && li === 0,
          })
        }
      })
    })
  })
  return options
}

// Map /api/playerStats response to a per-match-average match log entry
export const mapStatsToMatchLog = (statsResponse, seasonLabel) => {
  // statsResponse.statsSection.items[] contains stat groups
  const items = statsResponse?.statsSection?.items ?? []
  const stats = {}
  for (const item of items) {
    for (const stat of item.items ?? [item]) {
      if (stat.key) stats[stat.key] = stat.statValue?.value ?? stat.value
    }
  }

  const apps = Number(stats.appearances ?? stats.matches ?? stats.matchesPlayed ?? 1) || 1
  const avg = (keys) => {
    for (const k of keys) {
      if (stats[k] != null) return Math.round((Number(stats[k]) / apps) * 100) / 100
    }
    return undefined
  }

  return {
    date: new Date().toISOString().split('T')[0],
    opponent: `Season avg (${seasonLabel})`,
    competition: 'FotMob Import',
    result: '',
    minutesPlayed: stats.minutesPlayed != null ? Math.round(Number(stats.minutesPlayed) / apps) : 90,
    goals:          avg(['goals']),
    assists:        avg(['assists']),
    keyPasses:      avg(['keyPasses', 'keypasses']),
    shotOnTarget:   avg(['shotsOnTarget', 'onTargetScoringAttempt']),
    shotOffTarget:  avg(['shotsOffTarget', 'blockedScoringAttempt']),
    interceptions:  avg(['interceptions']),
    clearances:     avg(['clearances']),
    duelsWon:       avg(['successfulDuels', 'duelsWon']),
    aerialsWon:     avg(['aerialDuelsWon', 'wonContest']),
    foulsCommitted: avg(['foulsCommitted', 'fouls']),
    foulsWon:       avg(['foulsWon', 'wasFouled']),
    xG:             avg(['xGoals', 'expectedGoals', 'xg']),
    xA:             avg(['xAssists', 'expectedAssists', 'xa']),
  }
}
