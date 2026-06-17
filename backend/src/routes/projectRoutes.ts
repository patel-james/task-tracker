import express from 'express'
import {
  createProject,
  getProjects,
  getProjectById,
  addProjectMember
} from '../controllers/projectControllers.js'
import { createTask, getTasksByProject } from '../controllers/taskControllers.js'
import { authUser } from '../middleware/authMiddleware.js'

const router = express.Router()

// All routes here are mounted at /api/projects

router.post('/', authUser, createProject)           // POST   /api/projects
router.get('/', authUser, getProjects)              // GET    /api/projects
router.get('/:projectId', authUser, getProjectById) // GET    /api/projects/:projectId
router.post('/:projectId/members', authUser, addProjectMember) // POST /api/projects/:projectId/members
router.post('/:projectId/tasks', authUser, createTask)         // POST /api/projects/:projectId/tasks
router.get('/:projectId/tasks', authUser, getTasksByProject)   // GET  /api/projects/:projectId/tasks

export default router
