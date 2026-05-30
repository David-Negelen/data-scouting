import { METRICS, METRIC_CATEGORIES, metricsByCategory } from '@/constants/metricDefinitions'
import { isGK } from '@/constants/positions'

// Average a list of numeric values, ignoring zeros/nulls
const avg = (vals) => {
  const nonZero = vals.filter((v) => v != null && v > 0)
  return nonZero.length ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0
}

// Normalize a match-stat value to 0-100 using the metric's normMax
const normMatchStat = (metric, value) => {
  const v = value ?? 0
  if (metric.inverted) {
    const normalized = Math.max(0, 1 - v / (metric.normMax * 2))
    return normalized * 100
  }
  return Math.min(100, (v / (metric.normMax || 1)) * 100)
}

// Score a single category (returns 0-100)
export const categoryScore = (metrics, category, matchLogs = []) => {
  if (category === 'matchStats') {
    const statMetrics = metricsByCategory('matchStats')
    if (!matchLogs.length) return 0
    const perMatchScores = matchLogs.map((log) => {
      const scores = statMetrics.map((m) => normMatchStat(m, log[m.id] ?? 0))
      return avg(scores)
    })
    return avg(perMatchScores)
  }

  const catMetrics = metricsByCategory(category)
  return avg(catMetrics.map((m) => metrics?.[m.id] ?? 0))
}

// Calculate overall score (0-100)
export const overallScore = (player) => {
  const { metrics = {}, matchLogs = [], position } = player
  const gk = isGK(position)

  if (gk) {
    const gkScore = categoryScore(metrics, 'goalkeeping')
    const physScore = categoryScore(metrics, 'physical')
    const tacScore = categoryScore(metrics, 'tactical')
    return Math.round(gkScore * 0.5 + physScore * 0.2 + tacScore * 0.3)
  }

  const tech  = categoryScore(metrics, 'technical',  matchLogs)
  const phys  = categoryScore(metrics, 'physical',   matchLogs)
  const tac   = categoryScore(metrics, 'tactical',   matchLogs)
  const match = categoryScore(metrics, 'matchStats', matchLogs)

  const { technical, physical, tactical, matchStats } = METRIC_CATEGORIES
  return Math.round(
    tech  * technical.weight +
    phys  * physical.weight  +
    tac   * tactical.weight  +
    match * matchStats.weight,
  )
}

// Radar data for recharts
export const radarData = (player) => {
  const { metrics = {}, matchLogs = [], position } = player
  const gk = isGK(position)

  if (gk) {
    return [
      { subject: 'Goalkeeping', value: Math.round(categoryScore(metrics, 'goalkeeping')) },
      { subject: 'Physical',    value: Math.round(categoryScore(metrics, 'physical')) },
      { subject: 'Tactical',    value: Math.round(categoryScore(metrics, 'tactical')) },
      { subject: 'Distribution', value: Math.round(metrics.distribution ?? 0) },
      { subject: 'Composure',   value: Math.round(metrics.composure ?? 0) },
    ]
  }

  return [
    { subject: 'Technical',   value: Math.round(categoryScore(metrics, 'technical')) },
    { subject: 'Physical',    value: Math.round(categoryScore(metrics, 'physical')) },
    { subject: 'Tactical',    value: Math.round(categoryScore(metrics, 'tactical')) },
    { subject: 'Match Stats', value: Math.round(categoryScore(metrics, 'matchStats', matchLogs)) },
  ]
}

// Trend: compare avg of last 3 sessions vs previous 3
export const scoreTrend = (player) => {
  const logs = [...(player.matchLogs ?? [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  )
  if (logs.length < 4) return null

  const statMetrics = metricsByCategory('matchStats')
  const sessionScore = (log) =>
    avg(statMetrics.map((m) => normMatchStat(m, log[m.id] ?? 0)))

  const recent = avg(logs.slice(0, 3).map(sessionScore))
  const prior  = avg(logs.slice(3, 6).map(sessionScore))
  if (!prior) return null

  const delta = recent - prior
  return { delta: Math.round(delta), direction: delta > 2 ? 'up' : delta < -2 ? 'down' : 'flat' }
}

export const scoreColor = (score) => {
  if (score >= 80) return 'var(--success)'
  if (score >= 65) return 'var(--accent-primary)'
  if (score >= 50) return 'var(--warning)'
  return 'var(--danger)'
}

// Match stats sparkline data (last N games, single metric)
export const sparklineData = (player, metricId, n = 10) => {
  return [...(player.matchLogs ?? [])]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-n)
    .map((log, i) => ({ i, value: log[metricId] ?? 0 }))
}
