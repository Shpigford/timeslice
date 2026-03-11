import express from 'express'
import cors from 'cors'
import { initDb } from './db.js'
import clientsRouter from './routes/clients.js'
import blocksRouter from './routes/blocks.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Initialize database
initDb()

// Routes
app.use('/api/clients', clientsRouter)
app.use('/api/blocks', blocksRouter)

app.listen(PORT, () => {
  console.log(`Timeslice API running on http://localhost:${PORT}`)
})
