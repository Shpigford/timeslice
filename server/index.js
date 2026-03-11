import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDb } from './db.js'
import clientsRouter from './routes/clients.js'
import blocksRouter from './routes/blocks.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Initialize database
initDb()

// API Routes
app.use('/api/clients', clientsRouter)
app.use('/api/blocks', blocksRouter)

// Serve frontend in production
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Timeslice running on http://localhost:${PORT}`)
})
