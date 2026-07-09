import { theme } from '../theme'
import type { SeriesPoint } from '../types'

interface Props {
  points: SeriesPoint[]
}

const CHART_W = 640
const CHART_H = 200
const PAD_TOP = 10
const PAD_BOTTOM = 20

// Ported from the design's buildPanel() chart math: min/max-scale the series
// into the SVG box, split it at the last actual (non-forecast) point into a
// solid history polyline and a dashed forecast polyline, with a tinted band
// behind the forecast segment.
export default function ForecastChart({ points }: Props) {
  if (points.length === 0) return null

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const toXY = (i: number) => {
    const x = (i / (points.length - 1)) * CHART_W
    const y = CHART_H - PAD_BOTTOM - ((points[i].value - min) / range) * (CHART_H - PAD_TOP - PAD_BOTTOM)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }

  let lastHistoryIdx = points.length - 1
  for (let i = points.length - 1; i >= 0; i--) {
    if (!points[i].isForecast) {
      lastHistoryIdx = i
      break
    }
  }

  const historyPoints: string[] = []
  for (let i = 0; i <= lastHistoryIdx; i++) historyPoints.push(toXY(i))

  const forecastPoints: string[] = []
  for (let i = lastHistoryIdx; i < points.length; i++) forecastPoints.push(toXY(i))

  const forecastX = points.length > 1 ? (lastHistoryIdx / (points.length - 1)) * CHART_W : CHART_W
  const forecastW = CHART_W - forecastX

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} style={{ width: '100%', height: 200, display: 'block' }}>
      <line x1={0} y1={170} x2={CHART_W} y2={170} stroke={theme.color.border} strokeWidth={1} />
      <line x1={0} y1={100} x2={CHART_W} y2={100} stroke={theme.color.borderFaint} strokeWidth={1} />
      <line x1={0} y1={30} x2={CHART_W} y2={30} stroke={theme.color.borderFaint} strokeWidth={1} />
      {forecastPoints.length > 1 && (
        <rect x={forecastX} y={0} width={forecastW} height={CHART_H} fill={theme.color.accent} opacity={0.06} />
      )}
      <polyline points={historyPoints.join(' ')} fill="none" stroke={theme.color.accent} strokeWidth={2.5} />
      {forecastPoints.length > 1 && (
        <polyline
          points={forecastPoints.join(' ')}
          fill="none"
          stroke={theme.color.accent}
          strokeWidth={2.5}
          strokeDasharray="5,5"
        />
      )}
    </svg>
  )
}
