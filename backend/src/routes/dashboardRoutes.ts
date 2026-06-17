import express from 'express'
import { getDashboard } from '../controllers/dashboardControllers.js'
import { authUser } from '../middleware/authMiddleware.js'

const router = express.Router()

// Mounted at /api/dashboard

router.get('/', authUser, getDashboard) // GET /api/dashboard

export default router
