import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDataset, getMyProjects, addDatasetToProject } from '../lib/api'
import { Spinner, ErrorMsg, Modal } from '../components/ui'
import { ArrowLeft, ExternalLink, Tag, FileText, Building2, Plus, Check } from 'lucide-react'

function MetaRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-4 py-2 border-b border-navy-700/50 last:border-0">
      <span className="text-xs font-mono text-slate-500 w-36 shrink-0">{label}</span>
      <span className="text-xs text-slate-300 break-all">{value}</span>
    </div>
  )
}

export default function DatasetDetail() {
  const { uuid } = useParams()
  const navigate  = useNavigate()
  const [ds,       setDs]       = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [addOpen,  setAddOpen]  = useState(false)
  const [projects, setProjects] = useState([])
  const [selected, setSelected] = useState('')
  const [adding,   setAdding]   = useState(false)
  const [added,    setAdded]    = useState(false)

  useEffect(() => {
    getDataset(uuid)
      .then(setDs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [uuid])

  async function openAddModal() {
    const proj = await getMyProjects().catch(() => [])
    setProjects(proj)
    setSelected(proj[0]?.Name || '')
    setAdded(false)
    setAddOpen(true)
  }

  async function handleAdd() {
    if (!selected) return
    setAdding(true)
    try {
      await addDatasetToProject(selected, uuid)
      setAdded(true)
    } catch (e) {
      alert(e.message)
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size={24} /></div>
  if (error)   return <div className="py-8"><ErrorMsg message={error} /></div>
  if (!ds)     return null

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs font-mono mb-6 transition-colors">
        <ArrowLeft size={13} /> back to datasets
      </button>

      {/* Header */}
      <div className="card-glow p-6 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-cyan-500 uppercase tracking-widest mb-2">Dataset</p>
            <h1 className="text-lg font-bold text-slate-100 leading-snug mb-3">{ds.Name}</h1>
            {ds.AccessLevel === 'public'
              ? <span className="emerald-pill">public</span>
              : <span className="tag-pill">{ds.AccessLevel || 'restricted'}</span>}
          </div>
          <button onClick={openAddModal} className="btn-primary flex items-center gap-1.5 shrink-0">
            <Plus size={13} /> Add to project
          </button>
        </div>

        {ds.Description && (
          <p className="text-sm text-slate-400 leading-relaxed mt-4 border-t border-navy-700 pt-4">
            {ds.Description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Metadata */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card-glow p-5">
            <p className="section-title mb-4">Metadata</p>
            <MetaRow label="UUID"           value={ds.UUID} />
            <MetaRow label="Identifier"     value={ds.Identifier} />
            <MetaRow label="Category"       value={ds.Category} />
            <MetaRow label="Bureau Code"    value={ds.BureauCode} />
            <MetaRow label="Program Code"   value={ds.ProgramCode} />
            <MetaRow label="License"        value={ds.License} />
            <MetaRow label="First Published" value={ds.FirstPublished?.slice(0,10)} />
            <MetaRow label="Last Modified"  value={ds.LastModified?.slice(0,10)} />
            <MetaRow label="Metadata Created" value={ds.MetadataCreationDate?.slice(0,10)} />
            <MetaRow label="Metadata Updated" value={ds.MetadataUpdateDate?.slice(0,10)} />
            {ds.HomepageURL && (
              <div className="flex gap-4 py-2">
                <span className="text-xs font-mono text-slate-500 w-36 shrink-0">Homepage</span>
                <a href={ds.HomepageURL} target="_blank" rel="noreferrer"
                   className="text-xs text-cyan-400 hover:underline flex items-center gap-1 break-all">
                  {ds.HomepageURL} <ExternalLink size={10} />
                </a>
              </div>
            )}
          </div>

          {/* Files */}
          {ds.files?.length > 0 && (
            <div className="card-glow p-5">
              <p className="section-title mb-4">
                <FileText size={11} className="inline mr-1.5" />
                Available Files ({ds.files.length})
              </p>
              <div className="space-y-2">
                {ds.files.map(f => (
                  <div key={f.Link} className="flex items-center gap-3 py-2 border-b border-navy-700/50 last:border-0">
                    <span className="cyan-pill shrink-0">{f.Format}</span>
                    <a href={f.Link} target="_blank" rel="noreferrer"
                       className="text-xs text-slate-400 hover:text-cyan-400 truncate flex-1 font-mono transition-colors">
                      {f.Link}
                    </a>
                    <ExternalLink size={11} className="text-slate-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Tags */}
          {ds.tags?.length > 0 && (
            <div className="card-glow p-5">
              <p className="section-title mb-3">
                <Tag size={11} className="inline mr-1.5" />Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ds.tags.map(t => <span key={t} className="tag-pill">{t}</span>)}
              </div>
            </div>
          )}

          {/* Topics */}
          {ds.topics?.length > 0 && (
            <div className="card-glow p-5">
              <p className="section-title mb-3">Topics</p>
              <div className="flex flex-wrap gap-1.5">
                {ds.topics.map(t => <span key={t} className="emerald-pill">{t}</span>)}
              </div>
            </div>
          )}

          {/* Publisher */}
          {ds.PublisherEmailAddress && (
            <div className="card-glow p-5">
              <p className="section-title mb-3">
                <Building2 size={11} className="inline mr-1.5" />Publisher
              </p>
              <p className="text-xs font-mono text-slate-400 break-all">{ds.PublisherEmailAddress}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add to project modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add to Project">
        {added
          ? (
            <div className="text-center py-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                <Check size={18} className="text-emerald-400" />
              </div>
              <p className="text-sm text-slate-300 font-semibold">Added successfully!</p>
              <button onClick={() => setAddOpen(false)} className="btn-primary mt-4">Done</button>
            </div>
          )
          : projects.length === 0
          ? (
            <div>
              <p className="text-sm text-slate-400 mb-4">You have no projects yet. Create one first from the Projects page.</p>
              <button onClick={() => { setAddOpen(false); }} className="btn-ghost">Close</button>
            </div>
          )
          : (
            <div className="space-y-4">
              <div>
                <label className="label">Select project</label>
                <select className="input" value={selected} onChange={e => setSelected(e.target.value)}>
                  {projects.map(p => <option key={p.Name} value={p.Name}>{p.Name} ({p.Category})</option>)}
                </select>
              </div>
              <button onClick={handleAdd} disabled={adding} className="btn-primary w-full">
                {adding ? 'Adding…' : 'Add dataset'}
              </button>
            </div>
          )
        }
      </Modal>
    </div>
  )
}
