import { Router } from 'express'
import { getDb } from '../db.js'

const router = Router()

// GET /api/clients
router.get('/', (req, res) => {
  const db = getDb()
  const clients = db.prepare('SELECT * FROM clients ORDER BY name').all()
  res.json(clients)
})

// GET /api/clients/:id
router.get('/:id', (req, res) => {
  const db = getDb()
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id)
  if (!client) return res.status(404).json({ error: 'Client not found' })
  res.json(client)
})

// POST /api/clients
router.post('/', (req, res) => {
  const db = getDb()
  const { name, color, monthly_hours = 0 } = req.body
  if (!name || !color) return res.status(400).json({ error: 'Name and color are required' })

  const result = db.prepare(
    'INSERT INTO clients (name, color, monthly_hours) VALUES (?, ?, ?)'
  ).run(name, color, monthly_hours)

  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(client)
})

// PUT /api/clients/:id
router.put('/:id', (req, res) => {
  const db = getDb()
  const { name, color, monthly_hours } = req.body
  const existing = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Client not found' })

  db.prepare(
    `UPDATE clients SET name = ?, color = ?, monthly_hours = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(
    name ?? existing.name,
    color ?? existing.color,
    monthly_hours ?? existing.monthly_hours,
    req.params.id
  )

  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id)
  res.json(client)
})

// PATCH /api/clients/:id/archive
router.patch('/:id/archive', (req, res) => {
  const db = getDb()
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id)
  if (!client) return res.status(404).json({ error: 'Client not found' })

  const archived = client.archived ? 0 : 1
  db.prepare(`UPDATE clients SET archived = ?, updated_at = datetime('now') WHERE id = ?`).run(archived, req.params.id)
  const updated = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id)
  res.json(updated)
})

// DELETE /api/clients/:id
router.delete('/:id', (req, res) => {
  const db = getDb()
  const result = db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Client not found' })
  res.status(204).end()
})

export default router
