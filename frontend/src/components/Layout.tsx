import { NavLink, Outlet } from 'react-router-dom'
import {
  BarChart3,
  Brain,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/models', label: 'ML Models', icon: Brain },
  { to: '/predict', label: 'Predict', icon: Sparkles },
]

export function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-800/80 bg-slate-900/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-slate-800/80 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">EduPredict</h1>
            <p className="text-xs text-slate-400">Final Year Project</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 shadow-inner'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800/80 p-4">
          <div className="rounded-xl bg-slate-800/50 p-4">
            <p className="text-xs font-medium text-slate-300">Tech Stack</p>
            <p className="mt-1 text-xs text-slate-500">React + FastAPI + scikit-learn</p>
          </div>
        </div>
      </aside>

      <main className="ml-64 flex-1">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
