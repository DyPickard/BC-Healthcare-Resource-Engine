import { theme } from '../theme'
import type { MetricInfo, RegionSeries } from '../types'
import ForecastChart from './ForecastChart'

interface Props {
  series: RegionSeries | null
  metrics: MetricInfo[]
  selectedMetric: string
  onSelectMetric: (key: string) => void
  loading: boolean
}

export default function ChartPanel({ series, metrics, selectedMetric, onSelectMetric, loading }: Props) {
  const deltaPositive = series?.delta != null && series.delta >= 0
  const deltaColor =
    series?.delta == null
      ? theme.color.textMuted
      : deltaPositive
        ? theme.color.status.critical
        : theme.color.status.normal

  const first = series?.points[0]
  let nowLabel = series?.points[series.points.length - 1]?.month
  if (series) {
    for (let i = series.points.length - 1; i >= 0; i--) {
      if (!series.points[i].isForecast) {
        nowLabel = series.points[i].month
        break
      }
    }
  }
  const last = series?.points[series.points.length - 1]

  return (
    <div style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 3, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: theme.color.textPrimary }}>
            {series?.regionName ?? '—'}
          </div>
          <div style={{ fontSize: 11.5, color: theme.color.textSecondary }}>
            {series?.metricLabel ?? ''} · history + 6-month forecast
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {metrics.map((m) => (
            <div
              key={m.key}
              onClick={() => m.available && onSelectMetric(m.key)}
              title={m.available ? undefined : 'Coming soon — not yet produced by the data pipeline'}
              style={{
                fontSize: 11.5,
                fontWeight: 500,
                padding: '6px 10px',
                borderRadius: 3,
                cursor: m.available ? 'pointer' : 'not-allowed',
                background: m.key === selectedMetric ? theme.color.accent : '#f0f2f4',
                color: !m.available ? '#b7c0c7' : m.key === selectedMetric ? '#ffffff' : '#5a6670',
              }}
            >
              {m.label}
            </div>
          ))}
        </div>
      </div>

      {!series || loading ? (
        <div
          style={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.color.textMuted,
            fontSize: 12.5,
          }}
        >
          {loading ? 'Loading…' : 'No data for this metric yet'}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: theme.color.textPrimary, fontFamily: theme.font.mono }}>
              {series.current != null ? `${series.current}${series.unit}` : '—'}
            </div>
            {series.delta != null && (
              <div style={{ fontSize: 12.5, fontWeight: 500, color: deltaColor }}>
                {series.delta >= 0 ? '+' : ''}
                {series.delta}
                {series.unit} vs 6mo ago
              </div>
            )}
          </div>
          <ForecastChart points={series.points} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10.5,
              color: theme.color.textMuted,
              fontFamily: theme.font.mono,
              marginTop: 2,
            }}
          >
            <span>{first?.month}</span>
            <span>{nowLabel}</span>
            <span>{last?.month}</span>
          </div>
        </>
      )}
    </div>
  )
}
