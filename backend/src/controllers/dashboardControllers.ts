import pool from '../db/connection.js'
import type { RowDataPacket } from 'mysql2'
import type { Response } from 'express'
import type { AuthRequest } from '../middleware/authMiddleware.js'

// GET /api/dashboard
// Returns a summary for the logged-in user:
//   - all projects they belong to
//   - all tasks assigned to them
//   - the 10 most recent comments from their projects
export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const userId = req.user.id

    // All projects the user is a member of
    const [projects] = await pool.query<RowDataPacket[]>(
      `SELECT p.id, p.name, p.owner_id, p.created_at, pm.role
       FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       WHERE pm.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    )

    // All tasks assigned to the user, with the project name for context
    const [assignedTasks] = await pool.query<RowDataPacket[]>(
      `SELECT t.id, t.title, t.project_id, t.status, t.created_at,
              p.name AS project_name
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       WHERE t.assigned_to = ?
       ORDER BY t.created_at DESC`,
      [userId]
    )

    // The 10 most recent comments from any project the user belongs to
    const [recentComments] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.body, c.task_id, c.created_at,
              u.name AS commenter_name,
              t.title AS task_title,
              p.name AS project_name
       FROM comments c
       JOIN tasks t ON t.id = c.task_id
       JOIN projects p ON p.id = t.project_id
       JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ?
       JOIN users u ON u.id = c.user_id
       ORDER BY c.created_at DESC
       LIMIT 10`,
      [userId]
    )

    return res.status(200).json({ projects, assignedTasks, recentComments })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Server error' })
  }
}
