import Papa from 'papaparse'
import { METRICS } from '@/constants/metricDefinitions'

const METRIC_IDS = new Set(METRICS.map((m) => m.id))

export const parsePlayerCSV = (text) => {
  const { data, errors } = Papa.parse(text.trim(), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  })
  if (errors.length) throw new Error(errors[0].message)

  return data.map((row) => {
    const metrics = {}
    const matchLogFields = {}
    const base = {}

    for (const [key, value] of Object.entries(row)) {
      if (METRIC_IDS.has(key)) {
        metrics[key] = value ?? 0
      } else {
        base[key] = value
      }
    }

    return { ...base, metrics }
  })
}

export const exportPlayersCSV = (players) => {
  const allMetricIds = METRICS.map((m) => m.id)
  const rows = players.map((p) => {
    const row = {
      name: p.name,
      age: p.age,
      nationality: p.nationality,
      position: p.position,
      club: p.club,
      league: p.league,
      status: p.status,
      marketValue: p.marketValue,
      contractUntil: p.contractUntil,
    }
    for (const id of allMetricIds) {
      row[id] = p.metrics?.[id] ?? 0
    }
    return row
  })

  return Papa.unparse(rows)
}

export const downloadCSV = (csv, filename = 'players.csv') => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
