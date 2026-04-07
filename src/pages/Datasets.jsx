import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDatasets } from '../lib/api'
import { PageHeader, Spinner, EmptyState, ErrorMsg } from '../components/ui'
import { Search, Database, Filter, X, ChevronRight, ChevronLeft } from 'lucide-react'

export default function Datasets() {
  const navigate = useNavigate()
  const [datasets, setDatasets] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [offset,   setOffset]   = useState(0)
  const limit = 20

  const [filters, setFilters] = useState({ tag: '', format: '', org_type: '' })
  const [pending, setPending] = useState({ tag: '', format: '', org_type: '' })
  const [showFilters, setShowFilters] = useState(false)

  const fetchData = useCallback(async (f, o) => {
    setLoading(true); setError('')
    try {
      const data = await getDatasets({ ...f, limit, offset: o })
      setDatasets(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData(filters, offset) }, [filters, offset, fetchData])

  function applyFilters() {
    setFilters(pending)
    setOffset(0)
    setShowFilters(false)
  }

  function clearFilters() {
    const empty = { tag: '', format: '', org_type: '' }
    setPending(empty); setFilters(empty); setOffset(0)
    setShowFilters(false)
  }

  const hasFilters = filters.tag || filters.format || filters.org_type

  return (
    <div>
      <PageHeader
        title="Datasets"
        subtitle={`// catalog.data.gov — browse ${limit} per page`}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => { setPending(filters); setShowFilters(s => !s) }}
              className={`btn-ghost flex items-center gap-1.5 ${hasFilters ? 'border-cyan-500 text-cyan-400' : ''}`}
            >
              <Filter size={13} />
              Filters
              {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
            </button>
          </div>
        }
      />

      {/* Filter panel */}
      {showFilters && (
        <div className="card-glow p-5 mb-6 fade-up">
          <p className="section-title mb-4">Filter Datasets</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: 'tag',      label: 'Tag',               placeholder: 'e.g. health, energy…' },
              { key: 'format',   label: 'File Format',       placeholder: 'e.g. CSV, JSON, XML…' },
              { key: 'org_type', label: 'Organization Type', placeholder: 'e.g. Federal, University…' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    className="input pl-8"
                    placeholder={placeholder}
                    value={pending[key]}
                    onChange={e => setPending(p => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={applyFilters} className="btn-primary">Apply filters</button>
            <button onClick={clearFilters} className="btn-ghost flex items-center gap-1.5"><X size={12} />Clear</button>
          </div>
        </div>
      )}

      {/* Active filter badges */}
      {hasFilters && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {filters.tag      && <span className="cyan-pill">tag: {filters.tag}</span>}
          {filters.format   && <span className="cyan-pill">format: {filters.format}</span>}
          {filters.org_type && <span className="cyan-pill">org: {filters.org_type}</span>}
        </div>
      )}

      <ErrorMsg message={error} />

      {/* Table */}
      <div className="card-glow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-600 bg-navy-900/60">
              <th className="text-left px-4 py-3 text-xs font-mono text-slate-500 uppercase tracking-wider">Dataset</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-slate-500 uppercase tracking-wider hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-slate-500 uppercase tracking-wider hidden lg:table-cell">Access</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-slate-500 uppercase tracking-wider hidden lg:table-cell">Published</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-navy-700/50">
                    <td className="px-4 py-3"><div className="h-3 bg-navy-700 rounded animate-pulse w-3/4" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-3 bg-navy-700 rounded animate-pulse w-1/2" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-3 bg-navy-700 rounded animate-pulse w-1/3" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-3 bg-navy-700 rounded animate-pulse w-1/3" /></td>
                    <td />
                  </tr>
                ))
              : datasets.length === 0
              ? (
                  <tr><td colSpan={5} className="py-0">
                    <EmptyState icon={Database} title="No datasets found" description="Try adjusting your filters." />
                  </td></tr>
                )
              : datasets.map(ds => (
                  <tr
                    key={ds.UUID}
                    className="table-row cursor-pointer"
                    onClick={() => navigate(`/datasets/${ds.UUID}`)}
                  >
                    <td className="px-4 py-3">
                      <p className="text-slate-200 font-medium text-xs leading-snug line-clamp-2 max-w-xs">{ds.Name}</p>
                      <p className="text-slate-600 font-mono text-[10px] mt-0.5 truncate max-w-xs">{ds.UUID}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {ds.Category
                        ? <span className="tag-pill truncate max-w-[140px] block">{ds.Category}</span>
                        : <span className="text-slate-700 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {ds.AccessLevel === 'public'
                        ? <span className="emerald-pill">public</span>
                        : <span className="tag-pill">{ds.AccessLevel || '—'}</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-slate-500 font-mono text-xs">{ds.FirstPublished?.slice(0, 10) || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight size={14} className="text-slate-600" />
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs font-mono text-slate-600">
          Showing {offset + 1}–{offset + (datasets.length || 0)}
        </p>
        <div className="flex gap-2">
          <button
            disabled={offset === 0}
            onClick={() => setOffset(o => Math.max(0, o - limit))}
            className="btn-ghost flex items-center gap-1.5 disabled:opacity-30"
          >
            <ChevronLeft size={13} /> Prev
          </button>
          <button
            disabled={datasets.length < limit}
            onClick={() => setOffset(o => o + limit)}
            className="btn-ghost flex items-center gap-1.5 disabled:opacity-30"
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
