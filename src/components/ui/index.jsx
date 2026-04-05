import { Loader2 } from 'lucide-react'

export function Spinner({ size = 16 }) {
  return <Loader2 size={size} className="animate-spin text-cyan-400" />
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1 font-mono">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, sub, accent = 'cyan' }) {
  const colors = {
    cyan:    'text-cyan-400',
    emerald: 'text-emerald-400',
    violet:  'text-violet-400',
    amber:   'text-amber-400',
  }
  return (
    <div className="card-glow p-5">
      <p className="section-title mb-3">{label}</p>
      <p className={`text-3xl font-bold font-mono ${colors[accent]}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1 font-mono">{sub}</p>}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-xl bg-navy-800 border border-navy-600 flex items-center justify-center mb-4">
        <Icon size={20} className="text-slate-600" />
      </div>
      <p className="text-sm font-semibold text-slate-400">{title}</p>
      <p className="text-xs text-slate-600 mt-1 max-w-xs">{description}</p>
    </div>
  )
}

export function ErrorMsg({ message }) {
  if (!message) return null
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 font-mono">
      ✗ {message}
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card-glow w-full max-w-md p-6 fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      {label && <span className="label">{label}</span>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  )
}
