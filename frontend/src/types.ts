import type { Status } from './theme'

export interface Region {
  id: string
  name: string
  short: string
  currentUtil: number
  status: Status
  statusColor: string
}

export interface Kpis {
  avgBedUtil: number
  elevatedCount: number
  totalRegions: number
  avgErWait: number | null
  avgStaffing: number | null
}

export interface MetricInfo {
  key: string
  label: string
  unit: string
  available: boolean
}

export interface SeriesPoint {
  month: string
  value: number
  isForecast: boolean
}

export interface RegionSeries {
  regionId: string
  regionName: string
  metricKey: string
  metricLabel: string
  unit: string
  current: number | null
  delta: number | null
  points: SeriesPoint[]
}
