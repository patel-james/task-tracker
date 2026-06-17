import express from 'express'
import { addComment, getComments } from '../controllers/commentControllers.js'
import { authUser } from '../middleware/authMiddleware.js'

const router = express.Router()

// All routes here are mounted at /api/tasks

router.post('/:taskId/comments', authUser, addComment)  // POST /api/tasks/:taskId/comments
router.get('/:taskId/comments', authUser, getComments)  // GET  /api/tasks/:taskId/comments

export default router
