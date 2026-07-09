import { theme } from '../theme'
import type { Kpis } from '../types'

interface Props {
  kpis: Kpis
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 3, padding: '14px 16px' }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.05em',
          color: theme.color.textSecondary,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, color: theme.color.textPrimary, fontFamily: theme.font.mono, marginTop: 4 }}>
        {value}
      </div>
    </div>
  )
}

export default function KpiStrip({ kpis }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
      <Card label="System Avg Bed Utilization" value={`${kpis.avgBedUtil}%`} />
      <Card label="Regions Elevated/Critical" value={`${kpis.elevatedCount} / ${kpis.totalRegions}`} />
      <Card label="Avg ER Wait Time" value={kpis.avgErWait != null ? `${kpis.avgErWait} min` : '—'} />
      <Card label="Avg Patients / Nurse" value={kpis.avgStaffing != null ? `${kpis.avgStaffing}` : '—'} />
    </div>
  )
}
