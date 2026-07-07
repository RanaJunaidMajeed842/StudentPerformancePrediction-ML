import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Award, Brain, Target, Users } from 'lucide-react'
import { api } from '../api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import type { ModelMetric, Overview } from '../types'

const CLASS_LABELS: Record<string, string> = {
  H: 'High',
  M: 'Medium',
  L: 'Low',
}

export function Dashboard() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [models, setModels] = useState<ModelMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.overview(), api.models()])
      .then(([ov, md]) => {
        setOverview(ov)
        setModels(md)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (error || !overview) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
        {error || 'Failed to load dashboard. Ensure the backend is running on port 8000.'}
      </div>
    )
  }

  const chartData = overview.class_distribution.map((d) => ({
    name: CLASS_LABELS[d.class] ?? d.class,
    count: d.count,
    fill: d.color,
  }))

  return (
    <div>
      <PageHeader
        title={overview.title}
        description={overview.subtitle}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value={overview.total_students}
          subtext="In training dataset"
          icon={Users}
          accent="indigo"
        />
        <StatCard
          label="ML Models"
          value={overview.models_count}
          subtext="Classifiers trained"
          icon={Brain}
          accent="violet"
        />
        <StatCard
          label="Best Accuracy"
          value={`${(overview.best_accuracy * 100).toFixed(1)}%`}
          subtext={overview.best_model}
          icon={Award}
          accent="emerald"
        />
        <StatCard
          label="Target Classes"
          value="3"
          subtext="High, Medium, Low"
          icon={Target}
          accent="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">Class Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
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
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">Model Accuracy Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={models.map((m) => ({
                name: m.name.split(' ')[0],
                accuracy: m.accuracy_pct,
              }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={80} />
              <Tooltip
                formatter={(v) => [`${v}%`, 'Accuracy']}
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="accuracy" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm">
        <h3 className="mb-3 text-lg font-semibold text-white">Features Used for Prediction</h3>
        <div className="flex flex-wrap gap-2">
          {overview.features_used.map((f) => (
            <span
              key={f}
              className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300"
            >
              {f}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-400">
          This system predicts student academic performance (High / Medium / Low) using
          engagement metrics and attendance patterns, trained on real student dataset records.
        </p>
      </div>
    </div>
  )
}
