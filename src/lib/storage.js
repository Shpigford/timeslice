const KEYS = {
  clients: 'timeslice-clients',
  blocks: 'timeslice-blocks',
}

export function load(key) {
  try {
    return JSON.parse(localStorage.getItem(KEYS[key])) || []
  } catch {
    return []
  }
}

export function save(key, data) {
  localStorage.setItem(KEYS[key], JSON.stringify(data))
}

export function genId() {
  return crypto.randomUUID()
}
