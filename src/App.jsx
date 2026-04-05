import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import Login        from './pages/Login'
import Register     from './pages/Register'
import Dashboard    from './pages/Dashboard'
import Datasets     from './pages/Datasets'
import DatasetDetail from './pages/DatasetDetail'
import Projects     from './pages/Projects'
import Stats        from './pages/Stats'
import { Spinner }  from './components/ui'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <Spinner size={24} />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <Spinner size={24} />
    </div>
  )
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/datasets"  element={<ProtectedRoute><Datasets /></ProtectedRoute>} />
          <Route path="/datasets/:uuid" element={<ProtectedRoute><DatasetDetail /></ProtectedRoute>} />
          <Route path="/projects"  element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/stats"     element={<ProtectedRoute><Stats /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
