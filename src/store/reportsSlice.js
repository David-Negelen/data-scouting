import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const uid = () => crypto.randomUUID()

const useReportsStore = create(
  persist(
    (set) => ({
      reports: [],

      addReport: (data) =>
        set((s) => ({
          reports: [...s.reports, { ...data, id: uid(), createdAt: new Date().toISOString() }],
        })),

      updateReport: (id, updates) =>
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r,
          ),
        })),

      deleteReport: (id) =>
        set((s) => ({ reports: s.reports.filter((r) => r.id !== id) })),

      importReports: (reports) => set({ reports }),

      clearAll: () => set({ reports: [] }),
    }),
    { name: 'scout-reports' },
  ),
)

export default useReportsStore
