import { theme } from '../theme'
import type { Region } from '../types'

interface Props {
  region: Region
  selected: boolean
  onSelect: () => void
}

export default function RegionRow({ region, selected, onSelect }: Props) {
  const pulsing = region.status !== 'Normal'

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect()
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 24px',
        cursor: 'pointer',
        background: selected ? '#22303a' : 'transparent',
        borderLeft: `3px solid ${selected ? theme.color.accent : 'transparent'}`,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: region.statusColor,
          flexShrink: 0,
          animation: pulsing ? 'pulseDot 2.2s ease-in-out infinite' : 'none',
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 500,
            color: '#fff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {region.name}
        </div>
        <div style={{ fontSize: 11.5, color: theme.color.sidebarTextMuted, fontFamily: theme.font.mono }}>
          {region.currentUtil}% · {region.status}
        </div>
      </div>
    </div>
  )
}
