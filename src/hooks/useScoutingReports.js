import { useMemo } from 'react'
import { useReportsStore } from '@/store'

export function useScoutingReports(playerId) {
  const reports = useReportsStore((s) => s.reports)
  return useMemo(
    () =>
      (playerId
        ? reports.filter((r) => r.playerId === playerId)
        : reports
      ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [reports, playerId],
  )
}

export function useScoutingReport(id) {
  const reports = useReportsStore((s) => s.reports)
  return useMemo(() => reports.find((r) => r.id === id) ?? null, [reports, id])
}
