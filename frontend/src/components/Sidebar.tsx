import { theme } from '../theme'
import type { Region } from '../types'
import RegionRow from './RegionRow'

interface Props {
  regions: Region[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function Sidebar({ regions, selectedId, onSelect }: Props) {
  return (
    <div
      style={{
        width: 260,
        flexShrink: 0,
        background: theme.color.sidebarBg,
        color: '#fff',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '0 24px 20px', borderBottom: `1px solid ${theme.color.sidebarBorder}` }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.01em' }}>BC Health Authorities</div>
        <div style={{ fontSize: 12, color: theme.color.sidebarTextMuted, marginTop: 4 }}>
          Bed Utilization &amp; Capacity Planning
        </div>
      </div>
      <div
        style={{
          padding: '18px 24px 8px',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: '#7590a0',
          textTransform: 'uppercase',
        }}
      >
        Regions
      </div>
      {regions.map((r) => (
        <RegionRow key={r.id} region={r} selected={r.id === selectedId} onSelect={() => onSelect(r.id)} />
      ))}
      <div
        style={{
          marginTop: 'auto',
          padding: '16px 24px',
          borderTop: `1px solid ${theme.color.sidebarBorder}`,
          fontSize: 11,
          color: theme.color.sidebarTextFaint,
        }}
      >
        Data through Jul 2026 · 6-mo forecast
      </div>
    </div>
  )
}
