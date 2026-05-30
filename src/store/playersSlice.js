import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const uid = () => crypto.randomUUID()

const usePlayersStore = create(
  persist(
    (set) => ({
      players: [],

      addPlayer: (data) =>
        set((s) => ({
          players: [
            ...s.players,
            { ...data, id: uid(), matchLogs: [], metrics: {}, createdAt: new Date().toISOString() },
          ],
        })),

      updatePlayer: (id, updates) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p,
          ),
        })),

      deletePlayer: (id) =>
        set((s) => ({ players: s.players.filter((p) => p.id !== id) })),

      addMatchLog: (playerId, log) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === playerId
              ? { ...p, matchLogs: [...(p.matchLogs ?? []), { ...log, id: uid() }] }
              : p,
          ),
        })),

      updateMatchLog: (playerId, logId, updates) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === playerId
              ? {
                  ...p,
                  matchLogs: p.matchLogs.map((l) =>
                    l.id === logId ? { ...l, ...updates } : l,
                  ),
                }
              : p,
          ),
        })),

      deleteMatchLog: (playerId, logId) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === playerId
              ? { ...p, matchLogs: p.matchLogs.filter((l) => l.id !== logId) }
              : p,
          ),
        })),

      importPlayers: (players) => set({ players }),

      clearAll: () => set({ players: [] }),
    }),
    { name: 'scout-players' },
  ),
)

export default usePlayersStore
