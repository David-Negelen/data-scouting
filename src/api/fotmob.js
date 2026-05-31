import { log, logError } from '@/utils/logger'

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
  const options = []

  // statSeasons lists available seasons/tournaments but has no inline stats.
  // Mark them with tournamentId so the modal can fetch stats on demand.
  if (data.statSeasons?.length) {
    for (const season of data.statSeasons) {
      for (const t of season.tournaments ?? []) {
        const name = t.name ?? t.leagueName ?? t.tournamentName ?? ''
        options.push({
          label: `${season.seasonName ?? ''} — ${name}`,
          seasonName: season.seasonName ?? '',
          tournamentId: t.tournamentId,
          stats: null, // fetched lazily
        })
      }
    }
  }

  // mainLeague always has inline stats. Find the matching option and attach them,
  // or prepend a new option if it's not already listed.
  const ml = data.mainLeague
  if (ml?.stats?.length) {
    const stats = {}
    for (const s of ml.stats) {
      const k = s.localizedTitleId ?? s.title
      if (k && typeof s.value !== 'object') stats[k] = s.value
    }
    log('[FotMob] mainLeague stats', stats)
    const match = options.find(
      (o) => o.seasonName === ml.season && o.label.includes(ml.leagueName ?? '')
    )
    if (match) {
      match.stats = stats
    } else {
      options.unshift({
        label: `${ml.season} — ${ml.leagueName}`,
        seasonName: ml.season,
        tournamentId: ml.tournamentId ?? null,
        stats,
      })
    }
  }

  if (!options.length) logError('[FotMob] no options found, data keys', Object.keys(data))
  return options
}

// ------------------------------------------------------------------
// Per-season stats fetch (statSeasons entries have no inline stats)
// ------------------------------------------------------------------

export const fetchPlayerSeasonStats = async (playerId, tournamentId) => {
  log('[FotMob] fetching playerStats', { playerId, tournamentId })
  const data = await get(
    `/playerStats?playerId=${playerId}&tournamentId=${tournamentId}&isTournamentStats=true`
  )
  log('[FotMob] playerStats raw', data)

  const result = {}
  // Try multiple known response shapes
  const items = [
    ...(data?.statsSection?.items ?? []),
    ...(data?.sections?.flatMap?.((s) => s.items ?? []) ?? []),
    ...(data?.stats ?? []),
  ]
  for (const item of items) {
    const k = item.key ?? item.localizedTitleId
    if (k && item.value != null && typeof item.value !== 'object') result[k] = item.value
  }
  log('[FotMob] playerStats parsed', result)
  return result
}

// ------------------------------------------------------------------
// Match log mapping — handles both statSeasons and mainLeague key formats
// ------------------------------------------------------------------

export const mapStatsToMatchLog = (stats, seasonLabel) => {
  log('[FotMob] mapStats', { keys: Object.keys(stats), values: stats })
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
