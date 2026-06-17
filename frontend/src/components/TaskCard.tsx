import { useState } from 'react'
import type { Task } from '../types'
import { updateTaskStatus, deleteTask } from '../api/taskApi'
import CommentList from './CommentList'

type Props = {
  task: Task
  onDeleted: (taskId: number) => void
  onStatusChanged: (taskId: number, newStatus: Task['status']) => void
}

// Displays a single task with controls to change status, delete, and view/add comments.
export default function TaskCard({ task, onDeleted, onStatusChanged }: Props) {
  const [showComments, setShowComments] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<Task['status']>(task.status)
  const [error, setError] = useState('')

  const handleStatusChange = async (newStatus: Task['status']) => {
    setSelectedStatus(newStatus)
    const data = await updateTaskStatus(task.id, newStatus)
    if (data.message !== 'Task status updated successfully') {
      setError(data.message)
    } else {
      setError('')
      onStatusChanged(task.id, newStatus)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete task "${task.title}"?`)) return
    const data = await deleteTask(task.id)
    if (data.message === 'Task deleted successfully') {
      onDeleted(task.id)
    } else {
      setError(data.message)
    }
  }

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '12px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <strong>{task.title}</strong>

        {/* Status dropdown */}
        <select
          value={selectedStatus}
          onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
        >
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {/* Assigned user */}
        {task.assigned_name && (
          <span style={{ color: '#555', fontSize: '0.85em' }}>
            Assigned to: {task.assigned_name} ({task.assigned_email})
          </span>
        )}

        <button onClick={() => setShowComments((prev) => !prev)} style={{ marginLeft: 'auto' }}>
          {showComments ? 'Hide Comments' : 'Show Comments'}
        </button>

        <button onClick={handleDelete} style={{ color: 'red' }}>
          Delete
        </button>
      </div>

      {error && <p style={{ color: 'red', fontSize: '0.85em', marginTop: '6px' }}>{error}</p>}

      {/* Comments section — only rendered when toggled open */}
      {showComments && <CommentList taskId={task.id} />}
    </div>
  )
}
