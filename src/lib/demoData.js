import { format, addDays, subDays, startOfMonth, startOfWeek } from 'date-fns'

const DEMO_CLIENTS = [
  { name: 'Definitely Not AI', color: '#93c5fd', monthly_hours: 40 },
  { name: 'Pants Optional Inc', color: '#fda4af', monthly_hours: 24 },
  { name: 'Synergy Overdose', color: '#6ee7b7', monthly_hours: 32 },
  { name: 'The Pivot Factory', color: '#fcd34d', monthly_hours: 16 },
  { name: 'Ctrl+Z Studios', color: '#c4b5fd', monthly_hours: 20 },
]

// Deterministic ID generator so demo data is stable across calls
let _seed = 1
function demoId() {
  return `demo-${String(_seed++).padStart(4, '0')}`
}

export function generateDemoData() {
  _seed = 1
  const now = new Date()
  const nowISO = now.toISOString()

  const clients = DEMO_CLIENTS.map(c => ({
    id: demoId(),
    name: c.name,
    color: c.color,
    monthly_hours: c.monthly_hours,
    archived: 0,
    created_at: nowISO,
    updated_at: nowISO,
  }))

  // Build a pool of weekdays from 60 days ago through 6 months forward
  const rangeStart = subDays(now, 60)
  const rangeEnd = addDays(now, 180)
  const weekdays = []
  let d = rangeStart
  while (d <= rangeEnd) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) weekdays.push(new Date(d))
    d = addDays(d, 1)
  }

  // Distribute blocks across the full range — ~3-4 blocks per client per week
  const blocks = []
  const slotOptions = ['AM', 'PM']
  const hoursOptions = [3, 4, 4, 5, 6, 6, 6, 8]
  const usedSlots = new Set()

  // Each client gets blocks on a recurring pattern across all weekdays
  // Stagger clients so they don't all land on the same days
  const clientPatterns = [3, 4, 3, 5, 4] // block every N weekdays per client
  clients.forEach((client, ci) => {
    const every = clientPatterns[ci]
    const offset = ci * 2 // stagger start positions
    for (let i = offset; i < weekdays.length; i += every) {
      const date = format(weekdays[i], 'yyyy-MM-dd')
      let slot = slotOptions[(ci + i) % 2]
      const key = `${date}-${slot}`
      if (usedSlots.has(key)) {
        slot = slot === 'AM' ? 'PM' : 'AM'
        const altKey = `${date}-${slot}`
        if (usedSlots.has(altKey)) continue
      }
      usedSlots.add(`${date}-${slot}`)
      const hours = hoursOptions[(ci * 3 + i) % hoursOptions.length]
      blocks.push({
        id: demoId(),
        client_id: client.id,
        date,
        slot,
        hours,
        client_name: client.name,
        client_color: client.color,
        created_at: nowISO,
        updated_at: nowISO,
      })
    }
  })

  return { clients, blocks }
}
