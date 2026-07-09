import type { Kpis, MetricInfo, Region, RegionSeries } from './types'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.detail || `${path} failed with ${res.status}`)
  }
  return res.json()
}

export const api = {
  regions: () => get<Region[]>('/api/regions'),
  kpis: () => get<Kpis>('/api/kpis'),
  metrics: () => get<MetricInfo[]>('/api/metrics'),
  regionSeries: (regionId: string, metric: string) =>
    get<RegionSeries>(`/api/regions/${regionId}/series?metric=${metric}`),
}
