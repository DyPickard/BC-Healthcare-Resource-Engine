import { useEffect, useRef, useState } from 'react'
import { BC_REGION_SHAPES, MAP_VIEWBOX } from '../data/bcRegions'
import { theme } from '../theme'
import type { Region } from '../types'

interface Props {
  regions: Region[]
  selectedId: string | null
  onSelect: (id: string) => void
  maxHeight?: number
  showTitle?: boolean
}

interface Tooltip {
  name: string
  x: number
  y: number
}

// Interactive map of BC's real Health Authority boundaries. Clicking a region
// here or a row in the sidebar both drive the same selection in the parent, so
// selection stays in sync in either direction. Used both as the dashboard's
// small panel (selectedId set) and as the overview page's hero (selectedId
// null — every region reads as a fresh drill-in target).
export default function RegionalMap({ regions, selectedId, onSelect, maxHeight = 360, showTitle = true }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => clearTimer(), [])

  function clearTimer() {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current)
      hoverTimer.current = null
    }
  }

  function handleEnter(name: string, target: SVGPathElement, id: string) {
    setHoveredId(id)
    clearTimer()
    // Region name pops up only after a 2s dwell, for clarity on small regions.
    // Anchored to the region's own bounding box (top-centre) rather than the
    // cursor, so placement is stable regardless of where in the region you are.
    hoverTimer.current = setTimeout(() => {
      const container = containerRef.current
      if (!container) return
      const cRect = container.getBoundingClientRect()
      const pRect = target.getBoundingClientRect()
      setTooltip({
        name,
        x: pRect.left + pRect.width / 2 - cRect.left,
        y: pRect.top - cRect.top,
      })
    }, 2000)
  }

  function handleLeave(id: string) {
    setHoveredId((h) => (h === id ? null : h))
    clearTimer()
    setTooltip(null)
  }

  const byId: Record<string, Region> = {}
  for (const r of regions) byId[r.id] = r

  // Render selected/hovered region last so its stroke sits above neighbours.
  const topId = hoveredId ?? selectedId
  const ordered = [...BC_REGION_SHAPES].sort((a, b) =>
    a.id === topId ? 1 : b.id === topId ? -1 : 0,
  )

  return (
    <div style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 3, padding: 16 }}>
      {showTitle && (
        <div style={{ fontSize: 12, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 10 }}>Regional Map</div>
      )}
      <div ref={containerRef} style={{ position: 'relative' }}>
        <svg viewBox={MAP_VIEWBOX} style={{ width: '100%', height: 'auto', maxHeight, display: 'block' }}>
          {ordered.map((shape) => {
            const region = byId[shape.id]
            if (!region) return null
            const selected = shape.id === selectedId
            const hovered = shape.id === hoveredId
            return (
              <path
                key={shape.id}
                d={shape.path}
                onClick={() => onSelect(shape.id)}
                onMouseEnter={(e) => handleEnter(region.name, e.currentTarget, shape.id)}
                onMouseLeave={() => handleLeave(shape.id)}
                role="button"
                tabIndex={0}
                aria-label={`${region.name}: ${region.status}, ${region.currentUtil}% bed utilization`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSelect(shape.id)
                }}
                fill={selected ? theme.color.accentTint : hovered ? '#dbe8ea' : '#eef2f4'}
                stroke={selected ? theme.color.accent : hovered ? theme.color.accent : '#c7d0d6'}
                strokeWidth={selected || hovered ? 1.6 : 0.7}
                strokeLinejoin="round"
                style={{ cursor: 'pointer', outline: 'none', transition: 'fill 0.12s ease' }}
              />
            )
          })}

          {/* Labels + status dots on top of every fill. */}
          {BC_REGION_SHAPES.map((shape) => {
            const region = byId[shape.id]
            if (!region) return null
            return (
              <g key={`label-${shape.id}`} style={{ pointerEvents: 'none' }}>
                <circle cx={shape.labelX} cy={shape.labelY - 9} r={3.2} fill={region.statusColor} />
                <text
                  x={shape.labelX}
                  y={shape.labelY + 2}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={600}
                  fill={theme.color.textPrimary}
                  style={{ userSelect: 'none', paintOrder: 'stroke', stroke: '#eef2f4', strokeWidth: 2.5 }}
                >
                  {region.short}
                </text>
              </g>
            )
          })}
        </svg>

        {tooltip && (
          <div
            style={{
              position: 'absolute',
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, calc(-100% - 6px))',
              background: theme.color.sidebarBg,
              color: '#fff',
              fontSize: 12,
              fontWeight: 500,
              padding: '5px 9px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: '0 2px 8px rgba(16,32,44,0.25)',
              zIndex: 2,
            }}
          >
            {tooltip.name}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: 11, color: theme.color.textSecondary }}>
        <LegendDot color={theme.color.status.normal} label="Normal" />
        <LegendDot color={theme.color.status.elevated} label="Elevated" />
        <LegendDot color={theme.color.status.critical} label="Critical" />
      </div>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
      {label}
    </div>
  )
}
