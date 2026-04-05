import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProjects, createProject, getProjectDatasets } from '../lib/api'
import { PageHeader, Spinner, EmptyState, ErrorMsg, Modal } from '../components/ui'
import { FolderKanban, Plus, ChevronDown, ChevronRight, Database } from 'lucide-react'

const CATEGORIES = ['analytics', 'machine learning', 'field research']

export default function Projects() {
  const navigate  = useNavigate()
  const [projects,  setProjects]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [createOpen,setCreateOpen]= useState(false)
  const [form,      setForm]      = useState({ Name: '', Category: 'analytics' })
  const [creating,  setCreating]  = useState(false)
  const [createErr, setCreateErr] = useState('')
  const [expanded,  setExpanded]  = useState({})
  const [projDS,    setProjDS]    = useState({})

  async function load() {
    setLoading(true)
    try { setProjects(await getMyProjects()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true); setCreateErr('')
    try {
      await createProject(form)
      setCreateOpen(false)
      setForm({ Name: '', Category: 'analytics' })
      await load()
    } catch (err) {
      setCreateErr(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function toggleProject(name) {
    setExpanded(e => ({ ...e, [name]: !e[name] }))
    if (!projDS[name]) {
      try {
        const ds = await getProjectDatasets(name)
        setProjDS(p => ({ ...p, [name]: ds }))
      } catch {}
    }
  }

  const catColors = {
    analytics:         'cyan-pill',
    'machine learning':'emerald-pill',
    'field research':  'tag-pill',
  }

  return (
    <div>
      <PageHeader
        title="My Projects"
        subtitle="// track dataset usage across your research"
        action={
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-1.5">
            <Plus size={13} /> New project
          </button>
        }
      />

      <ErrorMsg message={error} />

      {loading
        ? <div className="flex justify-center py-20"><Spinner size={24} /></div>
        : projects.length === 0
        ? <EmptyState icon={FolderKanban} title="No projects yet" description="Create a project to start tracking which datasets you use and why." />
        : (
          <div className="space-y-3">
            {projects.map(p => (
              <div key={p.Name} className="card-glow overflow-hidden">
                {/* Project header */}
                <button
                  onClick={() => toggleProject(p.Name)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-navy-700/30 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-navy-700 border border-navy-600 flex items-center justify-center shrink-0">
                    <FolderKanban size={14} className="text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200">{p.Name}</p>
                    <span className={`${catColors[p.Category] || 'tag-pill'} mt-0.5`}>{p.Category}</span>
                  </div>
                  {expanded[p.Name]
                    ? <ChevronDown size={14} className="text-slate-500 shrink-0" />
                    : <ChevronRight size={14} className="text-slate-500 shrink-0" />}
                </button>

                {/* Expanded datasets */}
                {expanded[p.Name] && (
                  <div className="border-t border-navy-700 bg-navy-900/40">
                    {!projDS[p.Name]
                      ? <div className="flex justify-center py-4"><Spinner /></div>
                      : projDS[p.Name].length === 0
                      ? (
                        <p className="text-xs font-mono text-slate-600 text-center py-5">
                          No datasets added yet.{' '}
                          <span
                            className="text-cyan-500 cursor-pointer hover:underline"
                            onClick={() => navigate('/datasets')}
                          >Browse datasets →</span>
                        </p>
                      )
                      : projDS[p.Name].map(ds => (
                        <div
                          key={ds.UUID}
                          onClick={() => navigate(`/datasets/${ds.UUID}`)}
                          className="flex items-center gap-3 px-5 py-3 border-b border-navy-700/50 last:border-0 hover:bg-navy-700/30 cursor-pointer transition-colors"
                        >
                          <Database size={12} className="text-slate-600 shrink-0" />
                          <p className="text-xs text-slate-300 flex-1 truncate">{ds.Name}</p>
                          {ds.Category && <span className="tag-pill">{ds.Category}</span>}
                          <ChevronRight size={12} className="text-slate-600 shrink-0" />
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }

      {/* Create project modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Project name</label>
            <input
              className="input"
              placeholder="My Research Project"
              value={form.Name}
              onChange={e => setForm(f => ({ ...f, Name: e.target.value }))}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={form.Category}
              onChange={e => setForm(f => ({ ...f, Category: e.target.value }))}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <ErrorMsg message={createErr} />
          <button type="submit" disabled={creating} className="btn-primary w-full">
            {creating ? 'Creating…' : 'Create project'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
