import { Router } from 'express'
import { getDb } from '../db.js'

const router = Router()

// GET /api/blocks?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/', (req, res) => {
  const db = getDb()
  const { start, end } = req.query

  let query = `
    SELECT b.*, c.name as client_name, c.color as client_color
    FROM blocks b
    JOIN clients c ON b.client_id = c.id
  `
  const params = []

  if (start && end) {
    query += ' WHERE b.date >= ? AND b.date <= ?'
    params.push(start, end)
  } else if (start) {
    query += ' WHERE b.date >= ?'
    params.push(start)
  } else if (end) {
    query += ' WHERE b.date <= ?'
    params.push(end)
  }

  query += ' ORDER BY b.date, b.slot'
  const blocks = db.prepare(query).all(...params)
  res.json(blocks)
})

// POST /api/blocks
router.post('/', (req, res) => {
  const db = getDb()
  const { client_id, date, slot, hours = 6 } = req.body
  if (!client_id || !date || !slot) {
    return res.status(400).json({ error: 'client_id, date, and slot are required' })
  }

  const result = db.prepare(
    'INSERT INTO blocks (client_id, date, slot, hours) VALUES (?, ?, ?, ?)'
  ).run(client_id, date, slot, hours)

  const block = db.prepare(`
    SELECT b.*, c.name as client_name, c.color as client_color
    FROM blocks b JOIN clients c ON b.client_id = c.id
    WHERE b.id = ?
  `).get(result.lastInsertRowid)

  res.status(201).json(block)
})

// PUT /api/blocks/:id
router.put('/:id', (req, res) => {
  const db = getDb()
  const { client_id, date, slot, hours } = req.body
  const existing = db.prepare('SELECT * FROM blocks WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Block not found' })

  db.prepare(
    `UPDATE blocks SET client_id = ?, date = ?, slot = ?, hours = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(
    client_id ?? existing.client_id,
    date ?? existing.date,
    slot ?? existing.slot,
    hours ?? existing.hours,
    req.params.id
  )

  const block = db.prepare(`
    SELECT b.*, c.name as client_name, c.color as client_color
    FROM blocks b JOIN clients c ON b.client_id = c.id
    WHERE b.id = ?
  `).get(req.params.id)

  res.json(block)
})

// DELETE /api/blocks/:id
router.delete('/:id', (req, res) => {
  const db = getDb()
  const result = db.prepare('DELETE FROM blocks WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Block not found' })
  res.status(204).end()
})

export default router
