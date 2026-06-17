import pool from '../db/connection.js'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import type { Response } from 'express'
import type { AuthRequest } from '../middleware/authMiddleware.js'

type CommentRow = RowDataPacket & {
  id: number
  body: string
  task_id: number
  user_id: number
  created_at: string
  commenter_name: string
  commenter_email: string
}

// Returns the project_id for a task, or null if the task does not exist.
async function getTaskProjectId(taskId: number): Promise<number | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT project_id FROM tasks WHERE id = ?',
    [taskId]
  )
  return rows.length > 0 ? rows[0].project_id : null
}

// Checks if a user is a member of the given project.
async function isMember(projectId: number, userId: number): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, userId]
  )
  return rows.length > 0
}

// POST /api/tasks/:taskId/comments
// Adds a comment to a task. user_id always comes from the JWT, never from the body.
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const userId = req.user.id // always from JWT
    const taskId = Number(req.params.taskId)
    const { body } = req.body

    if (!body) {
      return res.status(400).json({ message: 'Comment body is required' })
    }

    const projectId = await getTaskProjectId(taskId)
    if (projectId === null) {
      return res.status(404).json({ message: 'Task not found' })
    }

    if (!(await isMember(projectId, userId))) {
      return res.status(403).json({ message: 'Access denied: you are not a member of this project' })
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO comments (body, task_id, user_id) VALUES (?, ?, ?)',
      [body, taskId, userId]
    )

    return res.status(201).json({ message: 'Comment added successfully', commentId: result.insertId })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/tasks/:taskId/comments
// Returns all comments for a task, including the commenter's name and email.
export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const userId = req.user.id
    const taskId = Number(req.params.taskId)

    const projectId = await getTaskProjectId(taskId)
    if (projectId === null) {
      return res.status(404).json({ message: 'Task not found' })
    }

    if (!(await isMember(projectId, userId))) {
      return res.status(403).json({ message: 'Access denied: you are not a member of this project' })
    }

    const [comments] = await pool.query<CommentRow[]>(
      `SELECT c.id, c.body, c.task_id, c.user_id, c.created_at,
              u.name AS commenter_name, u.email AS commenter_email
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.task_id = ?
       ORDER BY c.created_at ASC`,
      [taskId]
    )

    return res.status(200).json({ comments })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Server error' })
  }
}
