import { useEffect, useState } from 'react'
import { api } from '../api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { PageHeader } from '../components/PageHeader'
import type { ModelMetric } from '../types'

const CLASS_LABELS: Record<string, string> = { H: 'High', M: 'Medium', L: 'Low' }

export function Models() {
  const [models, setModels] = useState<ModelMetric[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.models()
      .then((data) => {
        setModels(data)
        setSelected(data[0]?.id ?? null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const active = models.find((m) => m.id === selected)

  return (
    <div>
      <PageHeader
        title="Machine Learning Models"
        description="Five classifiers trained and evaluated on 70% train / 30% test split. Compare accuracy, precision, and confusion matrices."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {models.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelected(m.id)}
            className={`rounded-2xl border p-4 text-left transition ${
              selected === m.id
                ? 'border-indigo-500/50 bg-indigo-500/10'
                : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            <p className="text-sm font-medium text-slate-300">{m.name}</p>
            <p className="mt-2 text-2xl font-bold text-white">{m.accuracy_pct}%</p>
            <p className="text-xs text-slate-500">accuracy</p>
          </button>
        ))}
      </div>

      {active && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="mb-4 text-lg font-semibold text-white">Performance Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Precision', value: active.precision },
                { label: 'Recall', value: active.recall },
                { label: 'F1 Score', value: active.f1 },
              ].map((metric) => (
                <div key={metric.label} className="rounded-xl bg-slate-800/50 p-4 text-center">
                  <p className="text-xs text-slate-400">{metric.label}</p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {(metric.value * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>

            <h4 className="mb-3 mt-6 text-sm font-semibold text-slate-300">Per-Class Report</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left text-slate-400">
                  <th className="pb-2">Class</th>
                  <th className="pb-2">Precision</th>
                  <th className="pb-2">Recall</th>
                  <th className="pb-2">F1</th>
                  <th className="pb-2">Support</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(active.class_report).map(([cls, r]) => (
                  <tr key={cls} className="border-b border-slate-800/50">
                    <td className="py-2 font-medium text-white">{CLASS_LABELS[cls] ?? cls}</td>
                    <td className="py-2 text-slate-300">{(r.precision * 100).toFixed(1)}%</td>
                    <td className="py-2 text-slate-300">{(r.recall * 100).toFixed(1)}%</td>
                    <td className="py-2 text-slate-300">{(r.f1 * 100).toFixed(1)}%</td>
                    <td className="py-2 text-slate-300">{r.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="mb-4 text-lg font-semibold text-white">Confusion Matrix</h3>
            <p className="mb-4 text-xs text-slate-500">Rows: actual · Columns: predicted (H, L, M)</p>
            <div className="overflow-x-auto">
              <table className="mx-auto text-sm">
                <thead>
                  <tr>
                    <th className="p-2" />
                    {['H', 'L', 'M'].map((c) => (
                      <th key={c} className="p-2 text-slate-400">
                        {CLASS_LABELS[c]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {active.confusion_matrix.map((row, i) => (
                    <tr key={i}>
                      <td className="p-2 font-medium text-slate-400">
                        {CLASS_LABELS[['H', 'L', 'M'][i]]}
                      </td>
                      {row.map((val, j) => {
                        const max = Math.max(...active.confusion_matrix.flat())
                        const intensity = max > 0 ? val / max : 0
                        return (
                          <td key={j} className="p-1">
                            <div
                              className="flex h-12 w-16 items-center justify-center rounded-lg font-medium text-white"
                              style={{
                                background: `rgba(99, 102, 241, ${0.15 + intensity * 0.85})`,
                              }}
                            >
                              {val}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
