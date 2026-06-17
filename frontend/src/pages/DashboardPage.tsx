import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboard } from '../api/dashboardApi'
import type { DashboardData } from '../types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')

  // Read the logged-in user's name from localStorage
  const user = JSON.parse(localStorage.getItem('user') ?? '{}')

  useEffect(() => {
    const fetchDashboard = async () => {
      const result = await getDashboard()
      // If the API returns an error message instead of data, handle it
      if ('message' in result) {
        setError((result as { message: string }).message)
      } else {
        setData(result)
      }
    }
    fetchDashboard()
  }, [])

  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!data) return <p>Loading dashboard...</p>

  return (
    <div>
      <h2>Welcome, {user.name}</h2>

      {/* Projects summary */}
      <section style={{ marginBottom: '30px' }}>
        <h3>Your Projects ({data.projects.length})</h3>
        {data.projects.length === 0 && <p>No projects yet.</p>}
        {data.projects.map((project) => (
          <div
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            style={{ cursor: 'pointer', padding: '8px', borderBottom: '1px solid #eee' }}
          >
            <strong>{project.name}</strong>
            <span style={{ marginLeft: '10px', color: '#666', fontSize: '0.85em' }}>({project.role})</span>
          </div>
        ))}
      </section>

      {/* Tasks assigned to the logged-in user */}
      <section style={{ marginBottom: '30px' }}>
        <h3>Tasks Assigned to You ({data.assignedTasks.length})</h3>
        {data.assignedTasks.length === 0 && <p>No tasks assigned to you.</p>}
        {data.assignedTasks.map((task) => (
          <div key={task.id} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
            <strong>{task.title}</strong>
            <span style={{ marginLeft: '10px', color: '#666', fontSize: '0.85em' }}>
              [{task.status}] — {task.project_name}
            </span>
          </div>
        ))}
      </section>

      {/* Recent activity across all projects */}
      <section>
        <h3>Recent Comments</h3>
        {data.recentComments.length === 0 && <p>No recent comments.</p>}
        {data.recentComments.map((comment) => (
          <div key={comment.id} style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '0.9em' }}>
            <strong>{comment.commenter_name}</strong> commented on{' '}
            <em>"{comment.task_title}"</em> in <strong>{comment.project_name}</strong>:
            <p style={{ margin: '4px 0 0' }}>{comment.body}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
