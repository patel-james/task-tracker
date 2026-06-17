import { BASE_URL, authHeaders } from './helpers'
import type { Task } from '../types'

type GetTasksResponse = { tasks: Task[] }
type CreateTaskResponse = { message: string; taskId: number }
type UpdateStatusResponse = { message: string }
type DeleteTaskResponse = { message: string }

export const getTasksByProject = async (
  projectId: number
): Promise<GetTasksResponse> => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    headers: authHeaders(),
  })
  return res.json()
}

export const createTask = async (
  projectId: number,
  title: string,
  assigned_to?: number | null
): Promise<CreateTaskResponse> => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title, assigned_to: assigned_to ?? null }),
  })
  return res.json()
}

export const updateTaskStatus = async (
  taskId: number,
  status: 'todo' | 'in_progress' | 'done'
): Promise<UpdateStatusResponse> => {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  })
  return res.json()
}

export const deleteTask = async (taskId: number): Promise<DeleteTaskResponse> => {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  return res.json()
}
