const API_BASE = '/api'

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (res.status === 204) return null
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }
  return res.json()
}

// Clients
export const clientsApi = {
  list: () => request('/clients'),
  get: (id) => request(`/clients/${id}`),
  create: (data) => request('/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/clients/${id}`, { method: 'DELETE' }),
  toggleArchive: (id) => request(`/clients/${id}/archive`, { method: 'PATCH' }),
}

// Blocks
export const blocksApi = {
  list: (start, end) => {
    const params = new URLSearchParams()
    if (start) params.set('start', start)
    if (end) params.set('end', end)
    return request(`/blocks?${params}`)
  },
  create: (data) => request('/blocks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/blocks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/blocks/${id}`, { method: 'DELETE' }),
}
