import { useState, useCallback } from 'react'

const MAX = 4

export function useCompare() {
  const [selectedIds, setSelectedIds] = useState([])

  const toggle = useCallback((id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX) return prev
      return [...prev, id]
    })
  }, [])

  const clear = useCallback(() => setSelectedIds([]), [])

  const canAdd = selectedIds.length < MAX

  return { selectedIds, toggle, clear, canAdd }
}
