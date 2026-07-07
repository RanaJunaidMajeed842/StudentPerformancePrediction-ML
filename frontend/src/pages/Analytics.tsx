import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '../api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { PageHeader } from '../components/PageHeader'
import type { ChartData, ChartListItem, CorrelationData } from '../types'

function CorrelationHeatmap({ data }: { data: CorrelationData }) {
  const getColor = (value: number) => {
    if (value >= 0.5) return 'bg-emerald-500/80'
    if (value >= 0.2) return 'bg-emerald-500/40'
    if (value >= -0.2) return 'bg-slate-600/60'
    if (value >= -0.5) return 'bg-red-500/40'
    return 'bg-red-500/80'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="p-2 text-left text-slate-400" />
            {data.labels.map((l) => (
              <th key={l} className="p-2 text-center text-xs font-medium text-slate-400">
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.labels.map((rowLabel, i) => (
            <tr key={rowLabel}>
              <td className="p-2 text-xs font-medium text-slate-400">{rowLabel}</td>
              {data.matrix[i].map((val, j) => (
                <td key={j} className="p-1">
                  <div
                    className={`flex h-10 items-center justify-center rounded-lg text-xs font-medium text-white ${getColor(val)}`}
                    title={`${rowLabel} vs ${data.labels[j]}: ${val}`}
                  >
                    {val.toFixed(2)}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ChartPanel({ chart }: { chart: ChartData }) {
  if (chart.type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chart.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chart.data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const groupedData = chart.categories.map((cat, i) => {
    const row: Record<string, string | number> = { category: cat }
    chart.series.forEach((s) => {
      row[s.name] = s.data[i]
    })
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
          }}
        />
        <Legend />
        {chart.series.map((s) => (
          <Bar key={s.name} dataKey={s.name} fill={s.color} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function Analytics() {
  const [charts, setCharts] = useState<ChartListItem[]>([])
  const [selected, setSelected] = useState('class_count')
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [correlation, setCorrelation] = useState<CorrelationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.chartList(), api.correlation()])
      .then(([list, corr]) => {
        setCharts(list.charts)
        setCorrelation(corr)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    api.chart(selected).then(setChartData).catch(console.error)
  }, [selected])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title="Data Analytics"
        description="Explore student performance patterns across demographics, engagement, and attendance factors."
      />

      <div className="mb-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm">
        <h3 className="mb-4 text-lg font-semibold text-white">Feature Correlation Matrix</h3>
        {correlation && <CorrelationHeatmap data={correlation} />}
      </div>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">
            {chartData?.title ?? 'Select a chart'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {charts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  selected === c.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
        {chartData && <ChartPanel chart={chartData} />}
      </div>
    </div>
  )
}
