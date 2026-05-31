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
  const data = pageData?.pageProps?.data ?? {}

  // Best case: full statSeasons breakdown (multi-season, multi-competition)
  if (data.statSeasons?.length) {
    const options = []
    for (const season of data.statSeasons) {
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
    if (options.length) return options
  }

  // Fallback: mainLeague has current season summary stats
  const ml = data.mainLeague
  if (ml?.stats?.length) {
    const stats = {}
    for (const s of ml.stats) {
      // localizedTitleId is the stable key (e.g. "goals", "assists", "matches_uppercase")
      const k = s.localizedTitleId ?? s.title
      if (k && typeof s.value !== 'object') stats[k] = s.value
    }
    return [{
      label: `${ml.season} — ${ml.leagueName}`,
      seasonName: ml.season,
      stats,
    }]
  }

  console.log('[FotMob] data keys:', Object.keys(data))
  return []
}

// ------------------------------------------------------------------
// Match log mapping — handles both statSeasons and mainLeague key formats
// ------------------------------------------------------------------

export const mapStatsToMatchLog = (stats, seasonLabel) => {
  const apps = Number(
    stats.matches_uppercase ?? stats.appearances ?? stats.matches ?? stats.matchesPlayed ?? 1
  ) || 1
  const mins = Number(stats.minutes_played ?? stats.minutesPlayed ?? apps * 90)

  const total = (...keys) => {
    for (const k of keys) {
      const v = stats[k]
      if (v != null && typeof v !== 'object') return Math.round(Number(v) * 100) / 100
    }
    return undefined
  }

  return {
    date: new Date().toISOString().split('T')[0],
    opponent: seasonLabel,
    competition: 'FotMob Import',
    isSeason: true,
    apps,
    totalMinutes: mins,
    result: '',
    // season totals (not per-match) — MatchLog renders them as totals
    goals:          total('goals'),
    assists:        total('assists'),
    keyPasses:      total('keyPasses', 'keypasses', 'key_passes'),
    shotOnTarget:   total('shotsOnTarget', 'shots_on_target'),
    interceptions:  total('interceptions'),
    clearances:     total('clearances'),
    xG:             total('xGoals', 'expectedGoals', 'xg', 'expected_goals'),
    xA:             total('xAssists', 'expectedAssists', 'xa', 'expected_assists'),
  }
}
