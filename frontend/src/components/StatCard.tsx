import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  subtext?: string
  icon: LucideIcon
  accent?: string
}

export function StatCard({ label, value, subtext, icon: Icon, accent = 'indigo' }: StatCardProps) {
  const accents: Record<string, string> = {
    indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400',
    violet: 'from-violet-500/20 to-violet-600/5 text-violet-400',
  }

  return (
    <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm transition hover:border-slate-700/80 hover:bg-slate-900/80">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
          {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
        </div>
        <div
          className={`rounded-xl bg-gradient-to-br p-3 ${accents[accent] ?? accents.indigo}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
