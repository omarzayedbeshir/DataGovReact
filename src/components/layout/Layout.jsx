import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { logout } from '../../lib/api'
import {
  LayoutDashboard, Database, FolderKanban, BarChart3,
  LogOut, Telescope, User, ChevronRight
} from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/datasets',  icon: Database,        label: 'Datasets'  },
  { to: '/projects',  icon: FolderKanban,    label: 'Projects'  },
  { to: '/stats',     icon: BarChart3,       label: 'Statistics'},
]

export default function Layout({ children }) {
  const { user, clearAuth } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try { await logout() } catch {}
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-navy-900 border-r border-navy-700 flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-navy-700">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-cyan-500 flex items-center justify-center">
              <Telescope size={15} className="text-navy-950" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-100">DataGov</p>
              <p className="text-[10px] font-mono text-cyan-500 tracking-widest uppercase">Lens</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="section-title px-2 mb-3">Navigation</p>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                 ${isActive
                   ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                   : 'text-slate-400 hover:text-slate-200 hover:bg-navy-700'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{label}</span>
                  {isActive && <ChevronRight size={12} className="ml-auto text-cyan-500" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-navy-700 p-3">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-navy-600 border border-navy-500 flex items-center justify-center">
              <User size={13} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.username}</p>
              <p className="text-[10px] font-mono text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-slate-500
                       hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 min-h-screen bg-navy-950 grid-bg">
        <div className="max-w-6xl mx-auto px-8 py-8 fade-up">
          {children}
        </div>
      </main>
    </div>
  )
}
