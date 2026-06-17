import { BASE_URL, authHeaders } from './helpers'
import type { Project, ProjectDetail, ProjectMember } from '../types'

type GetProjectsResponse = { projects: Project[] }
type GetProjectByIdResponse = {
  project: ProjectDetail
  yourRole: 'owner' | 'member'
  members: ProjectMember[]
}
type CreateProjectResponse = { message: string; projectId: number }
type AddMemberResponse = { message: string }

export const getProjects = async (): Promise<GetProjectsResponse> => {
  const res = await fetch(`${BASE_URL}/projects`, {
    headers: authHeaders(),
  })
  return res.json()
}

export const getProjectById = async (
  projectId: number
): Promise<GetProjectByIdResponse> => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}`, {
    headers: authHeaders(),
  })
  return res.json()
}

export const createProject = async (
  name: string
): Promise<CreateProjectResponse> => {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  })
  return res.json()
}

export const addMember = async (
  projectId: number,
  email: string
): Promise<AddMemberResponse> => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email }),
  })
  return res.json()
}
