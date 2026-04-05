import { useEffect, useState } from 'react'
import {
  getDatasetsByOrg, getDatasetsByTopic, getDatasetsByFormat,
  getDatasetsByOrgType, getTopTagsByProject
} from '../lib/api'
import { PageHeader, Spinner } from '../components/ui'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Treemap
} from 'recharts'

const COLORS = ['#22d3ee','#34d399','#a78bfa','#fbbf24','#f87171','#60a5fa','#fb923c','#e879f9']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-slate-400 mb-1">{label || payload[0].name}</p>
      <p className="text-cyan-400 font-semibold">{payload[0].value?.toLocaleString()}</p>
    </div>
  )
}

function SectionCard({ title, children, loading }) {
  return (
    <div className="card-glow p-5">
      <p className="section-title mb-5">{title}</p>
      {loading
        ? <div className="flex justify-center py-12"><Spinner size={20} /></div>
        : children
      }
    </div>
  )
}

export default function Stats() {
  const [byOrg,     setByOrg]     = useState([])
  const [byTopic,   setByTopic]   = useState([])
  const [byFormat,  setByFormat]  = useState([])
  const [byOrgType, setByOrgType] = useState([])
  const [tagsByProj,setTagsByProj]= useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      getDatasetsByOrg(),
      getDatasetsByTopic(),
      getDatasetsByFormat(),
      getDatasetsByOrgType(),
      getTopTagsByProject(),
    ]).then(([org, topic, fmt, orgType, tags]) => {
      setByOrg(org.slice(0, 10))
      setByTopic(topic.slice(0, 10))
      setByFormat(fmt)
      setByOrgType(orgType)
      setTagsByProj(tags)
    }).finally(() => setLoading(false))
  }, [])

  // Group tags by project category
  const tagGroups = tagsByProj.reduce((acc, row) => {
    if (!acc[row.category]) acc[row.category] = []
    acc[row.category].push(row)
    return acc
  }, {})

  const catColors = {
    analytics:         '#22d3ee',
    'machine learning':'#34d399',
    'field research':  '#a78bfa',
  }

  return (
    <div>
      <PageHeader
        title="Statistics"
        subtitle="// aggregate views across all datasets"
      />

      <div className="space-y-5">
        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionCard title="Datasets by Organization (Top 10)" loading={loading}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byOrg} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis
                  type="category" dataKey="label" width={140}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={v => v.length > 20 ? v.slice(0, 20) + '…' : v}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#22d3ee" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Datasets by Organization Type" loading={loading}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byOrgType} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={90} label={({ label }) => label?.slice(0,12)}>
                  {byOrgType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: '#0f1a2e', border: '1px solid #1e2d4a', borderRadius: 8, fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionCard title="Datasets by Topic (Top 10)" loading={loading}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byTopic}>
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickFormatter={v => v.length > 10 ? v.slice(0,10)+'…' : v} />
                <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Datasets by File Format" loading={loading}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byFormat}>
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        {/* Top tags by project type */}
        <SectionCard title="Top 10 Tags per Project Type" loading={loading}>
          {Object.keys(tagGroups).length === 0
            ? <p className="text-xs font-mono text-slate-600 text-center py-8">No tag data yet. Add datasets to projects to populate this view.</p>
            : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(tagGroups).map(([cat, tags]) => (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: catColors[cat] || '#94a3b8' }} />
                      <p className="text-xs font-mono font-semibold text-slate-300 capitalize">{cat}</p>
                    </div>
                    <div className="space-y-1.5">
                      {tags.slice(0, 10).map((t, i) => (
                        <div key={t.tag} className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-600 w-4">#{i+1}</span>
                          <div className="flex-1 bg-navy-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${(t.tag_count / tags[0].tag_count) * 100}%`,
                                background: catColors[cat] || '#94a3b8'
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 truncate max-w-[80px]">{t.tag}</span>
                          <span className="text-xs font-mono text-slate-600">{t.tag_count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </SectionCard>
      </div>
    </div>
  )
}
