import pool from '../db/connection.js'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import type { Response } from 'express'
import type { AuthRequest } from '../middleware/authMiddleware.js'

type TaskRow = RowDataPacket & {
  id: number
  title: string
  project_id: number
  created_by: number
  assigned_to: number | null
  status: 'todo' | 'in_progress' | 'done'
  created_at: string
  assigned_name?: string
  assigned_email?: string
}

// Checks if a user is a member of the given project.
async function isMember(projectId: number, userId: number): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, userId]
  )
  return rows.length > 0
}

// POST /api/projects/:projectId/tasks
// Creates a task inside a project. created_by always comes from the JWT.
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const createdBy = req.user.id // never trust this from the body
    const projectId = Number(req.params.projectId)
    const { title, assigned_to } = req.body

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' })
    }

    // The logged-in user must be a member of this project
    if (!(await isMember(projectId, createdBy))) {
      return res.status(403).json({ message: 'Access denied: you are not a member of this project' })
    }

    // If assigning to someone, make sure they are also a member of this project
    if (assigned_to !== undefined && assigned_to !== null) {
      if (!(await isMember(projectId, assigned_to))) {
        return res.status(400).json({ message: 'Cannot assign task: that user is not a member of this project' })
      }
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO tasks (title, project_id, created_by, assigned_to) VALUES (?, ?, ?, ?)',
      [title, projectId, createdBy, assigned_to ?? null]
    )

    return res.status(201).json({ message: 'Task created successfully', taskId: result.insertId })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/projects/:projectId/tasks
// Returns all tasks for a project. Includes the assigned user's name and email.
export const getTasksByProject = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const userId = req.user.id
    const projectId = Number(req.params.projectId)

    if (!(await isMember(projectId, userId))) {
      return res.status(403).json({ message: 'Access denied: you are not a member of this project' })
    }

    const [tasks] = await pool.query<TaskRow[]>(
      `SELECT t.id, t.title, t.project_id, t.created_by, t.assigned_to, t.status, t.created_at,
              u.name AS assigned_name, u.email AS assigned_email
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assigned_to
       WHERE t.project_id = ?
       ORDER BY t.created_at DESC`,
      [projectId]
    )

    return res.status(200).json({ tasks })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// PATCH /api/tasks/:taskId/status
// Updates the status of a task. The user must be a member of the task's project.
export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const userId = req.user.id
    const taskId = Number(req.params.taskId)
    const { status } = req.body

    const allowedStatuses = ['todo', 'in_progress', 'done']
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Allowed values: todo, in_progress, done' })
    }

    // Fetch the task to get its project_id
    const [tasks] = await pool.query<RowDataPacket[]>(
      'SELECT project_id FROM tasks WHERE id = ?',
      [taskId]
    )

    if (tasks.length === 0) {
      return res.status(404).json({ message: 'Task not found' })
    }

    const projectId = tasks[0].project_id

    // Verify the user belongs to that project
    if (!(await isMember(projectId, userId))) {
      return res.status(403).json({ message: 'Access denied: you are not a member of this project' })
    }

    await pool.query<ResultSetHeader>(
      'UPDATE tasks SET status = ? WHERE id = ?',
      [status, taskId]
    )

    return res.status(200).json({ message: 'Task status updated successfully' })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// DELETE /api/tasks/:taskId
// Deletes a task. The user must be a member of the task's project.
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const userId = req.user.id
    const taskId = Number(req.params.taskId)

    // Fetch the task to get its project_id
    const [tasks] = await pool.query<RowDataPacket[]>(
      'SELECT project_id FROM tasks WHERE id = ?',
      [taskId]
    )

    if (tasks.length === 0) {
      return res.status(404).json({ message: 'Task not found' })
    }

    const projectId = tasks[0].project_id

    // Verify the user belongs to that project
    if (!(await isMember(projectId, userId))) {
      return res.status(403).json({ message: 'Access denied: you are not a member of this project' })
    }

    await pool.query<ResultSetHeader>('DELETE FROM tasks WHERE id = ?', [taskId])

    return res.status(200).json({ message: 'Task deleted successfully' })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Server error' })
  }
}
