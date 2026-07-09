import type { CSSProperties } from 'react'
import { theme } from '../theme'
import type { RegionSeries } from '../types'

interface Props {
  series: RegionSeries | null
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '8px 16px',
  color: theme.color.textSecondary,
  fontWeight: 600,
  fontSize: 11,
  textTransform: 'uppercase',
}

export default function DetailTable({ series }: Props) {
  const rows = series ? series.points.slice(-18) : []

  return (
    <div style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 3, marginTop: 16 }}>
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${theme.color.border}`,
          fontSize: 12,
          fontWeight: 600,
          color: theme.color.textPrimary,
        }}
      >
        Monthly Detail — {series?.regionName ?? '—'}
      </div>
      <div style={{ maxHeight: 240, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ position: 'sticky', top: 0, background: theme.color.canvasInner }}>
              <th style={thStyle}>Month</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>{series?.metricLabel ?? 'Value'}</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.month} style={{ borderTop: `1px solid ${theme.color.borderFaint}` }}>
                <td style={{ padding: '7px 16px', color: '#3a4650', fontFamily: theme.font.mono }}>{row.month}</td>
                <td
                  style={{
                    padding: '7px 16px',
                    textAlign: 'right',
                    color: theme.color.textPrimary,
                    fontFamily: theme.font.mono,
                    fontWeight: 500,
                  }}
                >
                  {row.value}
                  {series?.unit}
                </td>
                <td
                  style={{
                    padding: '7px 16px',
                    textAlign: 'right',
                    fontSize: 11,
                    fontWeight: 600,
                    color: row.isForecast ? theme.color.accent : theme.color.textSecondary,
                  }}
                >
                  {row.isForecast ? 'Forecast' : 'Actual'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
