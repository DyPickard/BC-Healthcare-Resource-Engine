import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useKpis, useRegions } from './hooks'
import DashboardPage from './pages/DashboardPage'
import OverviewPage from './pages/OverviewPage'
import { theme } from './theme'

function App() {
  const { data: regions, error: regionsError } = useRegions()
  const { data: kpis } = useKpis()

  if (regionsError) {
    return (
      <div style={{ padding: 56, fontFamily: theme.font.sans, color: theme.color.status.critical }}>
        Could not reach the API: {regionsError}. Is the backend running (
        <code>docker compose up</code>)?
      </div>
    )
  }

  if (!regions || !kpis) {
    return <div style={{ padding: 56, fontFamily: theme.font.sans, color: theme.color.textSecondary }}>Loading…</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OverviewPage regions={regions} kpis={kpis} />} />
        <Route path="/region/:id" element={<DashboardPage regions={regions} kpis={kpis} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
