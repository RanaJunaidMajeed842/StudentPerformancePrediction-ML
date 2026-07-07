import { type FormEvent, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { api } from '../api'
import { PageHeader } from '../components/PageHeader'
import type { PredictionResult } from '../types'

const CLASS_LABELS: Record<string, string> = {
  H: 'High Performance',
  M: 'Medium Performance',
  L: 'Low Performance',
}

export function Predict() {
  const [raisedHands, setRaisedHands] = useState(25)
  const [visitedResources, setVisitedResources] = useState(20)
  const [discussion, setDiscussion] = useState(30)
  const [absenceDays, setAbsenceDays] = useState('Under-7')
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.predict({
        raised_hands: raisedHands,
        visited_resources: visitedResources,
        discussion,
        absence_days: absenceDays,
      })
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Performance Prediction"
        description="Enter student engagement metrics to predict academic performance class using all five trained models."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm"
        >
          <h3 className="mb-6 text-lg font-semibold text-white">Student Input</h3>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Raised Hands ({raisedHands})
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={raisedHands}
                onChange={(e) => setRaisedHands(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Visited Resources ({visitedResources})
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={visitedResources}
                onChange={(e) => setVisitedResources(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Discussion Participation ({discussion})
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={discussion}
                onChange={(e) => setDiscussion(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Student Absence Days
              </label>
              <div className="flex gap-3">
                {['Under-7', 'Above-7'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAbsenceDays(opt)}
                    className={`flex-1 rounded-xl border py-3 text-sm font-medium transition ${
                      absenceDays === opt
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {opt === 'Under-7' ? 'Under 7 days' : '7 or more days'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? 'Predicting...' : 'Run Prediction'}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm">
          <h3 className="mb-6 text-lg font-semibold text-white">Results</h3>

          {!result ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center text-slate-500">
              <Sparkles className="mb-3 h-10 w-10 opacity-30" />
              <p>Submit the form to see predictions from all models.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className="rounded-xl border p-5 text-center"
                style={{
                  borderColor: `${result.consensus.color}40`,
                  background: `${result.consensus.color}15`,
                }}
              >
                <p className="text-sm text-slate-400">Consensus Prediction</p>
                <p
                  className="mt-1 text-3xl font-bold"
                  style={{ color: result.consensus.color }}
                >
                  {CLASS_LABELS[result.consensus.prediction]}
                </p>
              </div>

              <div className="space-y-2">
                {Object.values(result.predictions).map((p) => (
                  <div
                    key={p.model}
                    className="flex items-center justify-between rounded-xl bg-slate-800/50 px-4 py-3"
                  >
                    <span className="text-sm text-slate-300">{p.model}</span>
                    <span
                      className="rounded-full px-3 py-1 text-sm font-semibold"
                      style={{
                        color: p.color,
                        background: `${p.color}20`,
                      }}
                    >
                      {p.prediction} — {CLASS_LABELS[p.prediction]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
