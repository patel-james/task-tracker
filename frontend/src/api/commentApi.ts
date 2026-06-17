import { BASE_URL, authHeaders } from './helpers'
import type { Comment } from '../types'

type GetCommentsResponse = { comments: Comment[] }
type AddCommentResponse = { message: string; commentId: number }

export const getComments = async (
  taskId: number
): Promise<GetCommentsResponse> => {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}/comments`, {
    headers: authHeaders(),
  })
  return res.json()
}

export const addComment = async (
  taskId: number,
  body: string
): Promise<AddCommentResponse> => {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ body }),
  })
  return res.json()
}
