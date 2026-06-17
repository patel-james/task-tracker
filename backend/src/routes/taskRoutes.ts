import express from 'express'
import { updateTaskStatus, deleteTask } from '../controllers/taskControllers.js'
import { authUser } from '../middleware/authMiddleware.js'

const router = express.Router()

// All routes here are mounted at /api/tasks

router.patch('/:taskId/status', authUser, updateTaskStatus) // PATCH  /api/tasks/:taskId/status
router.delete('/:taskId', authUser, deleteTask)             // DELETE /api/tasks/:taskId

export default router
