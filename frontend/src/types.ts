export interface Overview {
  title: string
  subtitle: string
  total_students: number
  features_used: string[]
  class_distribution: { class: string; count: number; color: string }[]
  models_count: number
  best_model: string
  best_accuracy: number
}

export interface ModelMetric {
  id: string
  name: string
  accuracy: number
  accuracy_pct: number
  precision: number
  recall: number
  f1: number
  confusion_matrix: number[][]
  class_report: Record<
    string,
    { precision: number; recall: number; f1: number; support: number }
  >
}

export interface ChartListItem {
  id: string
  name: string
}

export interface BarChartData {
  type: 'bar'
  title: string
  data: { name: string; value: number; color: string }[]
}

export interface GroupedBarChartData {
  type: 'grouped_bar'
  title: string
  categories: string[]
  series: { name: string; data: number[]; color: string }[]
}

export type ChartData = BarChartData | GroupedBarChartData

export interface CorrelationData {
  labels: string[]
  matrix: number[][]
}

export interface PredictionResult {
  input: {
    raised_hands: number
    visited_resources: number
    discussion: number
    absence_days: string
  }
  predictions: Record<
    string,
    { model: string; prediction: string; color: string }
  >
  consensus: { prediction: string; color: string }
}
