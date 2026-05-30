import { useMemo } from 'react'
import { usePlayersStore } from '@/store'
import { overallScore } from '@/utils/metricsCalc'

export function usePlayers() {
  const players = usePlayersStore((s) => s.players)

  const withScores = useMemo(
    () => players.map((p) => ({ ...p, overallScore: overallScore(p) })),
    [players],
  )

  const byStatus = useMemo(() => {
    return withScores.reduce((acc, p) => {
      const s = p.status ?? 'Prospect'
      acc[s] = (acc[s] ?? 0) + 1
      return acc
    }, {})
  }, [withScores])

  const top5 = useMemo(
    () => [...withScores].sort((a, b) => b.overallScore - a.overallScore).slice(0, 5),
    [withScores],
  )

  return { players: withScores, byStatus, top5 }
}

export function usePlayer(id) {
  const players = usePlayersStore((s) => s.players)
  return useMemo(() => {
    const p = players.find((p) => p.id === id)
    return p ? { ...p, overallScore: overallScore(p) } : null
  }, [players, id])
}
