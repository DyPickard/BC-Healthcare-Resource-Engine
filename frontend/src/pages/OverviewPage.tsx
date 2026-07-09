import { useNavigate } from 'react-router-dom'
import KpiStrip from '../components/KpiStrip'
import RegionalMap from '../components/RegionalMap'
import { theme } from '../theme'
import type { Kpis, Region } from '../types'

interface Props {
  regions: Region[]
  kpis: Kpis
}

export default function OverviewPage({ regions, kpis }: Props) {
  const navigate = useNavigate()

  return (
    <div
      style={{
        padding: '56px 56px 120px',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        alignItems: 'center',
        fontFamily: theme.font.sans,
      }}
    >
      <div style={{ width: 900, maxWidth: '100%', display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: theme.color.textPrimary }}>
          BC Health Authorities Dashboard
        </h1>
        <span style={{ fontSize: 14, color: theme.color.textSecondary }}>
          province-wide overview · click a region to drill in
        </span>
      </div>

      <section
        style={{
          width: 900,
          maxWidth: '100%',
          background: theme.color.surface,
          borderRadius: 4,
          boxShadow: '0 1px 3px rgba(16,32,44,0.12), 0 12px 32px rgba(16,32,44,0.08)',
          border: `1px solid ${theme.color.borderStrong}`,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: theme.color.textSecondary, textTransform: 'uppercase', marginBottom: 12 }}>
            British Columbia — System Overview
          </div>
          <KpiStrip kpis={kpis} />
        </div>

        <RegionalMap
          regions={regions}
          selectedId={null}
          onSelect={(id) => navigate(`/region/${id}`)}
          maxHeight={760}
          showTitle={false}
        />
      </section>
    </div>
  )
}
