import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getTopOrgs, getTopDatasets, getUsageByProjectType, getDatasetsByFormat } from '../lib/api'
import { StatCard, Spinner, EmptyState } from '../components/ui'
import { PageHeader } from '../components/ui'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Database, Building2, FolderKanban, TrendingUp } from 'lucide-react'

const CYAN    = '#22d3ee'
const EMERALD = '#34d399'
const VIOLET  = '#a78bfa'
const AMBER   = '#fbbf24'
const PIE_COLORS = [CYAN, EMERALD, VIOLET, AMBER, '#f87171']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-cyan-400 font-semibold">{payload[0].value.toLocaleString()}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [topOrgs,    setTopOrgs]    = useState([])
  const [topDS,      setTopDS]      = useState([])
  const [byProject,  setByProject]  = useState([])
  const [byFormat,   setByFormat]   = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([getTopOrgs(), getTopDatasets(), getUsageByProjectType(), getDatasetsByFormat()])
      .then(([orgs, ds, proj, fmt]) => {
        setTopOrgs(orgs)
        setTopDS(ds)
        setByProject(proj)
        setByFormat(fmt.slice(0, 5))
      })
      .finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={24} />
    </div>
  )

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${user?.username}.`}
        subtitle="// DataGov Lens — mission control"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Top Publisher" value={topOrgs[0]?.count ?? '—'} sub={topOrgs[0]?.label} accent="cyan" />
        <StatCard label="Top Dataset Users" value={topDS[0]?.user_count ?? '—'} sub="unique users" accent="emerald" />
        <StatCard label="Project Types" value={byProject.length} sub="tracked categories" accent="violet" />
        <StatCard label="File Formats" value={byFormat.length} sub="available formats" accent="amber" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Top orgs bar */}
        <div className="card-glow p-5">
          <p className="section-title mb-4">Top 5 Contributing Organizations</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topOrgs} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <YAxis
                type="category" dataKey="label" width={130}
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                tickFormatter={v => v.length > 18 ? v.slice(0, 18) + '…' : v}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill={CYAN} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Usage by project type pie */}
        <div className="card-glow p-5">
          <p className="section-title mb-4">Usage by Project Type</p>
          {byProject.length === 0
            ? <EmptyState icon={FolderKanban} title="No usage data yet" description="Add datasets to projects to see distribution." />
            : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byProject} dataKey="usage_count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                    {byProject.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: '#0f1a2e', border: '1px solid #1e2d4a', borderRadius: 8, fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top datasets */}
        <div className="card-glow p-5">
          <p className="section-title mb-4">Top 5 Datasets by Users</p>
          {topDS.length === 0
            ? <EmptyState icon={Database} title="No data yet" description="Usage data will appear here." />
            : (
              <div className="space-y-2">
                {topDS.map((d, i) => (
                  <div key={d.UUID} className="flex items-center gap-3 py-2 border-b border-navy-700 last:border-0">
                    <span className="text-xs font-mono text-slate-600 w-4">#{i+1}</span>
                    <p className="flex-1 text-xs text-slate-300 truncate">{d.Name}</p>
                    <span className="cyan-pill">{d.user_count} users</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Format distribution */}
        <div className="card-glow p-5">
          <p className="section-title mb-4">Datasets by File Format (Top 5)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byFormat}>
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill={EMERALD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
