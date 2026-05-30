import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

export const fmtDate = (iso, fmt = 'dd MMM yyyy') => {
  if (!iso) return '—'
  const d = typeof iso === 'string' ? parseISO(iso) : iso
  return isValid(d) ? format(d, fmt) : '—'
}

export const fmtRelative = (iso) => {
  if (!iso) return '—'
  const d = typeof iso === 'string' ? parseISO(iso) : iso
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—'
}

export const fmtMarketValue = (val) => {
  if (!val) return '—'
  const str = String(val).replace(/[^0-9.]/g, '')
  const n = parseFloat(str)
  if (isNaN(n)) return val
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `€${(n / 1_000).toFixed(0)}K`
  return `€${n}`
}

export const fmtStat = (val, decimals = 0) => {
  if (val == null || val === '') return '—'
  const n = parseFloat(val)
  return isNaN(n) ? String(val) : n.toFixed(decimals)
}

export const flagUrl = (code) =>
  code ? `https://flagcdn.com/24x18/${code.toLowerCase()}.png` : null

export const capitalize = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

export const pluralize = (n, singular, plural) =>
  `${n} ${n === 1 ? singular : (plural ?? singular + 's')}`
