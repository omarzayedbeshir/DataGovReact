import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../lib/api'
import { ErrorMsg } from '../components/ui'
import { Telescope } from 'lucide-react'

const COUNTRIES = [
  'United States','United Kingdom','Canada','Australia','Germany',
  'France','Egypt','UAE','India','Brazil','Other'
]
const GENDERS = ['Male','Female','Other','Prefer not to say']

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    EmailAddress: '', Username: '', Password: '',
    Country: '', Gender: '', Birthdate: ''
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  function update(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        className="input"
        placeholder={placeholder}
        value={form[name]}
        onChange={e => update(name, e.target.value)}
        required
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-navy-950 grid-bg flex items-center justify-center p-4 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/4 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm fade-up">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl bg-cyan-500 flex items-center justify-center">
            <Telescope size={18} className="text-navy-950" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-100 leading-none">DataGov</p>
            <p className="text-[10px] font-mono text-cyan-500 tracking-widest uppercase">Lens</p>
          </div>
        </div>

        <div className="card-glow p-7">
          <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">New Account</p>
          <h1 className="text-xl font-bold text-slate-100 mb-6">Create your profile</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email address"  name="EmailAddress" type="email"    placeholder="you@example.com" />
            <Field label="Username"       name="Username"                     placeholder="explorer_42" />
            <Field label="Password"       name="Password"     type="password" placeholder="••••••••" />
            <Field label="Date of birth"  name="Birthdate"    type="date" />

            <div>
              <label className="label">Country</label>
              <select className="input" value={form.Country} onChange={e => update('Country', e.target.value)} required>
                <option value="">Select country…</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.Gender} onChange={e => update('Gender', e.target.value)} required>
                <option value="">Select gender…</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <ErrorMsg message={error} />

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-500 hover:text-cyan-400 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
