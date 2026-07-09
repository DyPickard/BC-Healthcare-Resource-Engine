import { useEffect, useState } from 'react'
import { api } from './api'
import type { Kpis, MetricInfo, Region, RegionSeries } from './types'

function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetcher()
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, error, loading }
}

export function useRegions() {
  return useAsync<Region[]>(() => api.regions(), [])
}

export function useKpis() {
  return useAsync<Kpis>(() => api.kpis(), [])
}

export function useMetrics() {
  return useAsync<MetricInfo[]>(() => api.metrics(), [])
}

export function useRegionSeries(regionId: string, metric: string) {
  return useAsync<RegionSeries>(() => api.regionSeries(regionId, metric), [regionId, metric])
}
