import type {
  ChartData,
  ChartListItem,
  CorrelationData,
  ModelMetric,
  Overview,
  PredictionResult,
} from './types'

const API_BASE = '/api'

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  health: () => fetchJson<{ status: string }>('/health'),
  overview: () => fetchJson<Overview>('/overview'),
  models: () => fetchJson<ModelMetric[]>('/models'),
  correlation: () => fetchJson<CorrelationData>('/correlation'),
  chartList: () => fetchJson<{ charts: ChartListItem[] }>('/charts'),
  chart: (id: string) => fetchJson<ChartData>(`/charts/${id}`),
  predict: (body: {
    raised_hands: number
    visited_resources: number
    discussion: number
    absence_days: string
  }) =>
    fetchJson<PredictionResult>('/predict', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}
