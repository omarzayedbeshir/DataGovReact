const BASE = import.meta.env.VITE_API_URL ?? '/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
    return
  }

  const data = res.headers.get('content-type')?.includes('application/json')
    ? await res.json()
    : await res.text()

  if (!res.ok) throw new Error(data?.detail || 'Request failed')
  return data
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function login(email, password) {
  const form = new URLSearchParams({ username: email, password })
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.detail || 'Login failed')
  return data
}

export async function logout() {
  await request('/auth/logout', { method: 'POST' })
}

export async function getMe() {
  return request('/auth/me')
}

// ── Users ─────────────────────────────────────────────────────────────────────
export async function register(payload) {
  return request('/users/register', { method: 'POST', body: JSON.stringify(payload) })
}

export async function getMyUsage() {
  return request('/users/me/usage')
}

export async function getMyProjects() {
  return request('/users/me/projects')
}

// ── Datasets ──────────────────────────────────────────────────────────────────
export async function getDatasets({ org_type, format, tag, limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams()
  if (org_type) params.set('org_type', org_type)
  if (format)   params.set('format', format)
  if (tag)      params.set('tag', tag)
  params.set('limit', limit)
  params.set('offset', offset)
  return request(`/datasets/?${params}`)
}

export async function getDataset(uuid) {
  return request(`/datasets/${uuid}`)
}

// ── Projects ──────────────────────────────────────────────────────────────────
export async function createProject(payload) {
  return request('/projects/', { method: 'POST', body: JSON.stringify(payload) })
}

export async function addDatasetToProject(projectName, datasetUUID) {
  return request(`/projects/${encodeURIComponent(projectName)}/datasets`, {
    method: 'POST',
    body: JSON.stringify({ DatasetUUID: datasetUUID }),
  })
}

export async function getProjectDatasets(projectName) {
  return request(`/projects/${encodeURIComponent(projectName)}/datasets`)
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export async function getTopOrgs()           { return request('/stats/top-organizations') }
export async function getDatasetsByOrg()     { return request('/stats/datasets-by-organization') }
export async function getDatasetsByTopic()   { return request('/stats/datasets-by-topic') }
export async function getDatasetsByFormat()  { return request('/stats/datasets-by-format') }
export async function getDatasetsByOrgType() { return request('/stats/datasets-by-org-type') }
export async function getTopDatasets()       { return request('/stats/top-datasets-by-users') }
export async function getUsageByProjectType(){ return request('/stats/usage-by-project-type') }
export async function getTopTagsByProject()  { return request('/stats/top-tags-by-project-type') }
