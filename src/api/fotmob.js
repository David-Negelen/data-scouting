const BASE = '/api/fotmob'
const PAGE = '/fotmob-page'

const get = async (path) => {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`FotMob ${res.status}: ${path}`)
  return res.json()
}

export const searchPlayers = (name) =>
  get(`/data/search/suggest?hits=50&lang=en&term=${encodeURIComponent(name)}`)

// ------------------------------------------------------------------
// Player page data via Next.js _next/data route
// ------------------------------------------------------------------

let _buildId = null

async function getBuildId() {
  if (_buildId) return _buildId
  const res = await fetch(`${PAGE}/`)
  if (!res.ok) throw new Error('Could not load FotMob homepage')
  const html = await res.text()
  const m = html.match(/"buildId":"([^"]+)"/)
  if (!m) throw new Error('Could not extract FotMob build ID')
  _buildId = m[1]
  return _buildId
}

const toSlug = (name) =>
  name.toLowerCase()
    .replace(/[äâà]/g, 'a').replace(/[öôò]/g, 'o').replace(/[üûù]/g, 'u')
    .replace(/[ëê]/g, 'e').replace(/[ïî]/g, 'i').replace(/ß/g, 'ss').replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const getPlayerProfile = async (id, name) => {
  const buildId = await getBuildId()
  const slug = toSlug(name)
  const res = await fetch(`${PAGE}/_next/data/${buildId}/en/players/${id}/${slug}.json`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`FotMob ${res.status}: player page (slug: ${slug})`)
  return res.json()
}

// ------------------------------------------------------------------
// Season option extraction
// ------------------------------------------------------------------

export const getSeasonOptions = (pageData) => {
  // _next/data wraps everything in pageProps
  const data = pageData?.pageProps?.initialData ?? pageData?.pageProps ?? pageData
  const statSeasons = data?.statSeasons ?? data?.career?.statSeasons ?? []

  if (!statSeasons.length) {
    console.log('[FotMob] No statSeasons found in:', Object.keys(data ?? {}))
    return []
  }

  const options = []
  for (const season of statSeasons) {
    for (const t of season.tournaments ?? []) {
      const stats = {}
      for (const s of t.stats ?? []) {
        if (s.key) stats[s.key] = s.value
      }
      options.push({
        label: `${season.seasonName ?? ''} — ${t.leagueName ?? t.tournamentName ?? ''}`,
        seasonName: season.seasonName ?? '',
        stats,
      })
    }
  }
  return options
}

// ------------------------------------------------------------------
// Match log mapping
// ------------------------------------------------------------------

export const mapStatsToMatchLog = (stats, seasonLabel) => {
  const apps = Number(stats.appearances ?? stats.matches ?? stats.matchesPlayed ?? 1) || 1
  const avg = (...keys) => {
    for (const k of keys) {
      const v = stats[k]
      if (v != null) return Math.round((Number(v) / apps) * 100) / 100
    }
    return undefined
  }

  return {
    date: new Date().toISOString().split('T')[0],
    opponent: `Season avg (${seasonLabel})`,
    competition: 'FotMob Import',
    result: '',
    minutesPlayed: stats.minutesPlayed != null ? Math.round(Number(stats.minutesPlayed) / apps) : 90,
    goals:          avg('goals'),
    assists:        avg('assists'),
    keyPasses:      avg('keyPasses', 'keypasses'),
    shotOnTarget:   avg('shotsOnTarget', 'onTargetScoringAttempt'),
    shotOffTarget:  avg('shotsOffTarget', 'blockedScoringAttempt'),
    interceptions:  avg('interceptions'),
    clearances:     avg('clearances'),
    duelsWon:       avg('successfulDuels', 'duelsWon'),
    aerialsWon:     avg('aerialDuelsWon', 'wonContest'),
    foulsCommitted: avg('foulsCommitted', 'fouls'),
    foulsWon:       avg('foulsWon', 'wasFouled'),
    xG:             avg('xGoals', 'expectedGoals', 'xg'),
    xA:             avg('xAssists', 'expectedAssists', 'xa'),
  }
}
