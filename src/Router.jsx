import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import DashboardPage from '@/pages/DashboardPage'
import PlayersPage from '@/pages/PlayersPage'
import PlayerDetailPage from '@/pages/PlayerDetailPage'
import ScoutingReportPage from '@/pages/ScoutingReportPage'
import ComparePage from '@/pages/ComparePage'
import SettingsPage from '@/pages/SettingsPage'

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="players/:id" element={<PlayerDetailPage />} />
        <Route path="reports" element={<ScoutingReportPage />} />
        <Route path="compare" element={<ComparePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
