import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  CartesianGrid,
  Label
} from 'recharts'
import { theme } from '../theme'
import type { SeriesPoint } from '../types'

interface Props {
  points: SeriesPoint[]
  unit?: string
  yAxisLabel?: string
}

export default function ForecastChart({ points, unit = '%', yAxisLabel = 'Utilization (%)' }: Props) {
  if (points.length === 0) return null

  // Find the boundary where the forecast begins
  let lastHistoryIdx = points.length - 1
  for (let i = points.length - 1; i >= 0; i--) {
    if (!points[i].isForecast) {
      lastHistoryIdx = i
      break
    }
  }

  // To connect the history line and the forecast line smoothly,
  // the exact point where history ends must be shared by both lines.
  const chartData = points.map((p, i) => {
    const isHistoryOrConnect = i <= lastHistoryIdx
    const isForecastOrConnect = i >= lastHistoryIdx

    return {
      month: p.month,
      historyValue: isHistoryOrConnect ? p.value : null,
      forecastValue: isForecastOrConnect ? p.value : null,
      isForecastArea: p.isForecast
    }
  })

  // Determine the start and end of the forecast background area
  const firstForecastMonth = points[lastHistoryIdx].month
  const lastForecastMonth = points[points.length - 1].month

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.color.borderFaint} />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: theme.color.textMuted }}
            axisLine={false}
            tickLine={false}
            minTickGap={20}
          >
            <Label value="Month" offset={-15} position="insideBottom" style={{ fill: theme.color.textMuted, fontSize: 12, fontWeight: 500 }} />
          </XAxis>

          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 12, fill: theme.color.textMuted }}
            axisLine={false}
            tickLine={false}
          >
            <Label value={yAxisLabel} angle={-90} position="insideLeft" offset={-5} style={{ fill: theme.color.textMuted, fontSize: 12, fontWeight: 500 }} />
          </YAxis>

          <Tooltip
            contentStyle={{ borderRadius: 8, borderColor: theme.color.border, fontFamily: theme.font.sans }}
            formatter={(value: any, name: any) => [
              `${Number(value).toFixed(1)}${unit}`,
              name === 'historyValue' ? 'Actual' : 'Forecast'
            ]}
            labelStyle={{ color: theme.color.textPrimary, fontWeight: 600, marginBottom: 4 }}
          />

          {/* Shaded background for the forecast period */}
          {lastHistoryIdx < points.length - 1 && (
            <ReferenceArea x1={firstForecastMonth} x2={lastForecastMonth} fill={theme.color.accent} fillOpacity={0.06} />
          )}

          {/* Solid line for Historical Data */}
          <Line
            type="monotone"
            dataKey="historyValue"
            stroke={theme.color.accent}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 6, fill: theme.color.accent }}
            connectNulls
            animationDuration={400}
          />

          {/* Dashed line for Forecast Data */}
          <Line
            type="monotone"
            dataKey="forecastValue"
            stroke={theme.color.accent}
            strokeWidth={2.5}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 6, fill: theme.color.accent }}
            connectNulls
            animationDuration={400}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
