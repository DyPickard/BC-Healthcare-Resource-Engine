import { useNavigate } from 'react-router-dom'
import KpiStrip from '../components/KpiStrip'
import RegionalMap from '../components/RegionalMap'
import Sidebar from '../components/Sidebar'
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
        padding: 'clamp(20px, 4vw, 56px) clamp(16px, 4vw, 56px) 120px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        alignItems: 'center',
        fontFamily: theme.font.sans,
      }}
    >
      <div style={{ width: 1360, maxWidth: '100%', display: 'flex', alignItems: 'center', gap: 14 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: theme.color.textPrimary }}>
          BC Health Authorities Dashboard
        </h1>
        <span style={{ fontSize: 14, color: theme.color.textSecondary, marginTop: 6 }}>
          province-wide overview · click a region to drill in
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 4, background: '#fef3c7', color: '#b45309', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Mock Data Demo
          </span>
        </div>
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
          <Sidebar regions={regions} selectedId={null} onSelect={(id) => navigate(`/region/${id}`)} />
          
          <div style={{ flex: 1, minWidth: 0, padding: '24px 28px', background: theme.color.canvasInner }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: theme.color.textSecondary, textTransform: 'uppercase', marginBottom: 12 }}>
              British Columbia — System Overview
            </div>
            <KpiStrip kpis={kpis} />
            <div style={{ marginTop: 16 }}>
              <RegionalMap
                regions={regions}
                selectedId={null}
                onSelect={(id) => navigate(`/region/${id}`)}
                maxHeight={760}
                showTitle={false}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
