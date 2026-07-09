import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import ChartPanel from '../components/ChartPanel'
import DetailTable from '../components/DetailTable'
import KpiStrip from '../components/KpiStrip'
import RegionalMap from '../components/RegionalMap'
import Sidebar from '../components/Sidebar'
import { useMetrics, useRegionSeries } from '../hooks'
import { theme } from '../theme'
import type { Kpis, Region } from '../types'

interface Props {
  regions: Region[]
  kpis: Kpis
}

const DEFAULT_METRIC = 'bedUtilization'

export default function DashboardPage({ regions, kpis }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedMetric, setSelectedMetric] = useState(DEFAULT_METRIC)

  const { data: metrics } = useMetrics()
  const validId = regions.some((r) => r.id === id)
  const { data: series, loading: seriesLoading } = useRegionSeries(validId ? id! : '', selectedMetric)

  // Unknown region in the URL → bounce back to the overview.
  if (!validId) return <Navigate to="/" replace />

  const selectRegion = (regionId: string) => navigate(`/region/${regionId}`)

  return (
    <div
      style={{
        padding: '56px 56px 120px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        alignItems: 'flex-start',
        fontFamily: theme.font.sans,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            border: `1px solid ${theme.color.border}`,
            background: theme.color.surface,
            color: theme.color.accent,
            fontFamily: theme.font.sans,
            fontSize: 13,
            fontWeight: 500,
            padding: '6px 12px',
            borderRadius: 3,
            cursor: 'pointer',
          }}
        >
          ← All regions
        </button>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: theme.color.textPrimary }}>
          BC Health Authorities Dashboard
        </h1>
      </div>

      <section
        style={{
          width: 1360,
          maxWidth: '100%',
          background: theme.color.surface,
          borderRadius: 4,
          boxShadow: '0 1px 3px rgba(16,32,44,0.12), 0 12px 32px rgba(16,32,44,0.08)',
          overflow: 'hidden',
          border: `1px solid ${theme.color.borderStrong}`,
        }}
      >
        <div style={{ display: 'flex', minHeight: 900 }}>
          <Sidebar regions={regions} selectedId={id!} onSelect={selectRegion} />

          <div style={{ flex: 1, minWidth: 0, padding: '24px 28px', overflowY: 'auto', background: theme.color.canvasInner }}>
            <KpiStrip kpis={kpis} />

            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }}>
              <RegionalMap regions={regions} selectedId={id!} onSelect={selectRegion} />
              <ChartPanel
                series={series}
                metrics={metrics ?? []}
                selectedMetric={selectedMetric}
                onSelectMetric={setSelectedMetric}
                loading={seriesLoading}
              />
            </div>

            <DetailTable series={series} />
          </div>
        </div>
      </section>
    </div>
  )
}
