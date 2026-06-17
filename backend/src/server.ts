import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import pool from './db/connection.js'
import authRoutes from './routes/authRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'

const app = express()
const PORT: number = Number(process.env.PORT) || 8000

// Allow requests from the Vite dev server (http://localhost:5173)
app.use(cors())
app.use(express.json())

// Health-check routes (useful while developing)
app.get('/test', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'task tracker api is running ;)' })
})

app.get('/test-db', async (_req: Request, res: Response) => {
  try {
    const [row] = await pool.query('SELECT 1 AS Good')
    return res.status(200).json({ message: 'DB connected', row })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Failed to connect to DB' })
  }
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/tasks', commentRoutes) // comment routes are also under /api/tasks/:taskId/comments
app.use('/api/dashboard', dashboardRoutes)

app.listen(PORT, () => {
  console.log(`The app is running on http://localhost:${PORT}`)
})
