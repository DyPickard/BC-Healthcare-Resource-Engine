import { useState } from 'react'
import { theme } from '../theme'
import type { MetricInfo, RegionSeries } from '../types'
import ForecastChart from './ForecastChart'

type TimeFilter = '30D' | '90D' | '1Y' | 'MAX'

interface Props {
  series: RegionSeries | null
  metrics: MetricInfo[]
  selectedMetric: string
  onSelectMetric: (key: string) => void
  loading: boolean
}

export default function ChartPanel({ series, metrics, selectedMetric, onSelectMetric, loading }: Props) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('MAX')
  const [showForecast, setShowForecast] = useState<boolean>(true)

  const deltaPositive = series?.delta != null && series.delta >= 0
  const deltaColor =
    series?.delta == null
      ? theme.color.textMuted
      : deltaPositive
        ? theme.color.status.critical
        : theme.color.status.normal

  let nowLabel = series?.points[series.points.length - 1]?.month
  let lastHistoryIdx = series ? series.points.length - 1 : -1

  if (series) {
    for (let i = series.points.length - 1; i >= 0; i--) {
      if (!series.points[i].isForecast) {
        lastHistoryIdx = i
        nowLabel = series.points[i].month
        break
      }
    }
  }

  let filteredPoints = series?.points || []
  if (series && timeFilter !== 'MAX') {
    // Map time filters to number of historical months to show
    // We add +1 so "30 days" (1 month) shows 2 points to form a line
    let historyPointsToKeep = 0
    if (timeFilter === '30D') historyPointsToKeep = 2
    if (timeFilter === '90D') historyPointsToKeep = 4
    if (timeFilter === '1Y') historyPointsToKeep = 13

    const startIndex = Math.max(0, lastHistoryIdx - historyPointsToKeep + 1)
    filteredPoints = series.points.slice(startIndex)
  }

  if (!showForecast) {
    filteredPoints = filteredPoints.filter(p => !p.isForecast)
  }

  const first = filteredPoints[0]
  const last = filteredPoints[filteredPoints.length - 1]

  return (
    <div style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 3, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: theme.color.textPrimary }}>
            {series?.regionName ?? '—'}
          </div>
          <div style={{ fontSize: 11.5, color: theme.color.textSecondary }}>
            {series?.metricLabel ?? ''} · {showForecast ? 'history + 6-month forecast' : 'historical data only'}
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
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
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
            
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: theme.color.textMuted, cursor: 'pointer', userSelect: 'none' }}>
                <input 
                  type="checkbox" 
                  checked={showForecast} 
                  onChange={(e) => setShowForecast(e.target.checked)} 
                  style={{ accentColor: theme.color.accent, margin: 0, cursor: 'pointer' }}
                />
                Show Forecast
              </label>

              <div style={{ display: 'flex', gap: 4 }}>
                {(['30D', '90D', '1Y', 'MAX'] as TimeFilter[]).map((tf) => (
                <div
                  key={tf}
                  onClick={() => setTimeFilter(tf)}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    background: tf === timeFilter ? theme.color.textMuted : 'transparent',
                    color: tf === timeFilter ? '#ffffff' : theme.color.textMuted,
                    border: `1px solid ${tf === timeFilter ? theme.color.textMuted : theme.color.borderFaint}`,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tf}
                </div>
              ))}
            </div>
          </div>
          </div>
          <ForecastChart 
            points={filteredPoints} 
            unit={series.unit} 
            yAxisLabel={`${series.metricLabel} (${series.unit.trim()})`} 
          />
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
