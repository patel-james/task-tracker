import pool from '../db/connection.js'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import type { Response } from 'express'
import type { AuthRequest } from '../middleware/authMiddleware.js'

type ProjectRow = RowDataPacket & {
  id: number
  name: string
  owner_id: number
  created_at: string
  role?: string
}

type MemberRow = RowDataPacket & {
  id: number
  name: string
  email: string
  role: 'member' | 'owner'
}

// POST /api/projects
// Creates a new project and adds the creator as owner in project_members.
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const { name } = req.body
    const ownerId = req.user.id // always from JWT, never from body

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' })
    }

    // Use a transaction so both inserts succeed or both are rolled back
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO projects (name, owner_id) VALUES (?, ?)',
        [name, ownerId]
      )

      const projectId = result.insertId

      await connection.query<ResultSetHeader>(
        'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
        [projectId, ownerId, 'owner']
      )

      await connection.commit()
      return res.status(201).json({ message: 'Project created successfully', projectId })
    } catch (err) {
      await connection.rollback()
      throw err
    } finally {
      connection.release()
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/projects
// Returns all projects where the logged-in user is a member.
export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const userId = req.user.id

    const [projects] = await pool.query<ProjectRow[]>(
      `SELECT p.id, p.name, p.owner_id, p.created_at, pm.role
       FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       WHERE pm.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    )

    return res.status(200).json({ projects })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/projects/:projectId
// Returns a single project with its members list.
// Only accessible if the logged-in user is a member.
export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const userId = req.user.id
    const projectId = Number(req.params.projectId)

    // Check that the requesting user is a member of this project
    const [membership] = await pool.query<RowDataPacket[]>(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    )

    if (membership.length === 0) {
      return res.status(403).json({ message: 'Access denied: you are not a member of this project' })
    }

    const [projects] = await pool.query<ProjectRow[]>(
      'SELECT id, name, owner_id, created_at FROM projects WHERE id = ?',
      [projectId]
    )

    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Also fetch all members so the frontend can show them (e.g. for task assignment dropdown)
    const [members] = await pool.query<MemberRow[]>(
      `SELECT u.id, u.name, u.email, pm.role
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = ?`,
      [projectId]
    )

    return res.status(200).json({
      project: projects[0],
      yourRole: membership[0].role,
      members
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/projects/:projectId/members
// Adds another user to a project by email. Only the project owner can do this.
export const addProjectMember = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const requestingUserId = req.user.id
    const projectId = Number(req.params.projectId)
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    // Only project owners can add members
    const [ownership] = await pool.query<RowDataPacket[]>(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, requestingUserId]
    )

    if (ownership.length === 0 || ownership[0].role !== 'owner') {
      return res.status(403).json({ message: 'Only project owners can add members' })
    }

    // Find the target user by email
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(404).json({ message: 'No user found with that email' })
    }

    const targetUserId = users[0].id

    // Make sure they are not already a member
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, targetUserId]
    )

    if (existing.length > 0) {
      return res.status(409).json({ message: 'That user is already a member of this project' })
    }

    await pool.query<ResultSetHeader>(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, targetUserId, 'member']
    )

    return res.status(201).json({ message: 'Member added successfully' })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Server error' })
  }
}
