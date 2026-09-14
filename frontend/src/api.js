const BASE = '/api'

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`)
  return res.json()
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`)
  return res.json()
}

export const api = {
  analyze: (payload) => post('/analyze', payload),
  graph: () => get('/graph'),
  escalate: (payload) => post('/escalate', payload),
  feedback: (payload) => post('/feedback', payload),
  evalSummary: () => get('/eval'),
  health: () => get('/health'),
}
