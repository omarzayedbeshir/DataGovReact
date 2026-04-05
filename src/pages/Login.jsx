import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { login } from '../lib/api'
import { ErrorMsg } from '../components/ui'
import { Telescope, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { setAuth }             = useAuth()
  const navigate                = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      setAuth(data.access_token, { email: data.email, username: data.username })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 grid-bg flex items-center justify-center p-4">
      {/* Glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm fade-up">
        {/* Logo */}
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
          <p className="text-xs font-mono text-cyan-500 uppercase tracking-widest mb-1">Access Terminal</p>
          <h1 className="text-xl font-bold text-slate-100 mb-6">Sign in to your account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <ErrorMsg message={error} />

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Authenticating...' : 'Sign in →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-5">
          No account?{' '}
          <Link to="/register" className="text-cyan-500 hover:text-cyan-400 font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
