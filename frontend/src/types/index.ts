// Shared TypeScript types used across the frontend.
// These mirror the shape of the data returned by our API.

export type User = {
  id: number
  name: string
  email: string
}

export type Project = {
  id: number
  name: string
  owner_id: number
  created_at: string
  role?: 'owner' | 'member' // included when fetched via project_members join
}

export type ProjectMember = {
  id: number
  name: string
  email: string
  role: 'owner' | 'member'
}

// Full project detail includes the member list (returned by GET /api/projects/:id)
export type ProjectDetail = {
  id: number
  name: string
  owner_id: number
  created_at: string
}

export type Task = {
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

export type Comment = {
  id: number
  body: string
  task_id: number
  user_id: number
  created_at: string
  commenter_name: string
  commenter_email: string
}

export type LoginResponse = {
  message: string
  token: string
  user: User
}

export type SignupResponse = {
  message: string
  UserId: number
}

export type DashboardData = {
  projects: Project[]
  assignedTasks: (Task & { project_name: string })[]
  recentComments: (Comment & { task_title: string; project_name: string })[]
}
