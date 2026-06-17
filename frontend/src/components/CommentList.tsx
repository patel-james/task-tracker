import { useState, useEffect } from 'react'
import type { Comment } from '../types'
import { getComments, addComment } from '../api/commentApi'

type Props = {
  taskId: number
}

// Fetches and displays comments for a task, and provides an "Add Comment" form.
export default function CommentList({ taskId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchComments = async () => {
      const data = await getComments(taskId)
      setComments(data.comments ?? [])
      setLoading(false)
    }
    fetchComments()
  }, [taskId])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return

    const data = await addComment(taskId, body)
    if (data.commentId) {
      // Re-fetch comments so the new one appears with the commenter name
      const updated = await getComments(taskId)
      setComments(updated.comments ?? [])
      setBody('')
      setError('')
    } else {
      setError(data.message)
    }
  }

  if (loading) return <p style={{ marginTop: '8px' }}>Loading comments...</p>

  return (
    <div style={{ marginTop: '10px', paddingLeft: '12px', borderLeft: '2px solid #eee' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '6px' }}>Comments ({comments.length})</p>

      {comments.length === 0 && <p style={{ color: '#888' }}>No comments yet.</p>}

      {comments.map((comment) => (
        <div key={comment.id} style={{ marginBottom: '8px', fontSize: '0.9em' }}>
          <strong>{comment.commenter_name}</strong>{' '}
          <span style={{ color: '#888' }}>({comment.commenter_email})</span>
          <p style={{ margin: '2px 0' }}>{comment.body}</p>
          <span style={{ color: '#aaa', fontSize: '0.8em' }}>
            {new Date(comment.created_at).toLocaleString()}
          </span>
        </div>
      ))}

      <form onSubmit={handleAddComment} style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ flex: 1, padding: '6px' }}
        />
        <button type="submit">Post</button>
      </form>

      {error && <p style={{ color: 'red', fontSize: '0.85em' }}>{error}</p>}
    </div>
  )
}
