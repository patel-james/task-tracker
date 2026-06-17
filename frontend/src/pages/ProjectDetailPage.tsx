import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getProjectById, addMember } from '../api/projectApi'
import { getTasksByProject, createTask } from '../api/taskApi'
import type { ProjectDetail, ProjectMember, Task } from '../types'
import TaskCard from '../components/TaskCard'

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const id = Number(projectId)

  // Project state
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [yourRole, setYourRole] = useState<'owner' | 'member'>('member')

  // Task state
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState<number | ''>('')

  // Add member state
  const [memberEmail, setMemberEmail] = useState('')
  const [memberMsg, setMemberMsg] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const [projectData, taskData] = await Promise.all([
        getProjectById(id),
        getTasksByProject(id),
      ])

      if ('message' in projectData) {
        setError((projectData as { message: string }).message)
      } else {
        setProject(projectData.project)
        setMembers(projectData.members)
        setYourRole(projectData.yourRole)
      }

      setTasks(taskData.tasks ?? [])
      setLoading(false)
    }
    fetchAll()
  }, [id])

  // Called by TaskCard when the user deletes a task
  const handleTaskDeleted = (taskId: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  // Called by TaskCard when the user changes a task status
  const handleStatusChanged = (taskId: number, newStatus: Task['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const assignedTo = newTaskAssignedTo !== '' ? Number(newTaskAssignedTo) : null
    const data = await createTask(id, newTaskTitle, assignedTo)

    if (data.taskId) {
      // Re-fetch tasks so assigned user info is populated
      const taskData = await getTasksByProject(id)
      setTasks(taskData.tasks ?? [])
      setNewTaskTitle('')
      setNewTaskAssignedTo('')
    } else {
      setError(data.message || 'Failed to create task')
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberEmail.trim()) return

    const data = await addMember(id, memberEmail)
    setMemberMsg(data.message)
    setMemberEmail('')

    if (data.message === 'Member added successfully') {
      // Re-fetch project to get the updated member list
      const projectData = await getProjectById(id)
      if (!('message' in projectData)) {
        setMembers(projectData.members)
      }
    }
  }

  if (loading) return <p>Loading project...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!project) return null

  return (
    <div>
      <h2>{project.name}</h2>
      <p style={{ color: '#666' }}>Your role: {yourRole}</p>

      {/* Member list */}
      <section style={{ marginBottom: '24px' }}>
        <h3>Members ({members.length})</h3>
        <ul style={{ paddingLeft: '20px' }}>
          {members.map((m) => (
            <li key={m.id}>
              {m.name} ({m.email}) — <em>{m.role}</em>
            </li>
          ))}
        </ul>

        {/* Only project owners can add members */}
        {yourRole === 'owner' && (
          <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <input
              type="email"
              placeholder="Add member by email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              style={{ flex: 1, padding: '6px' }}
            />
            <button type="submit">Add Member</button>
          </form>
        )}
        {memberMsg && (
          <p style={{ color: memberMsg.includes('success') ? 'green' : 'red', marginTop: '6px' }}>
            {memberMsg}
          </p>
        )}
      </section>

      {/* Task list */}
      <section style={{ marginBottom: '24px' }}>
        <h3>Tasks ({tasks.length})</h3>

        {tasks.length === 0 && <p>No tasks yet. Create one below.</p>}

        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDeleted={handleTaskDeleted}
            onStatusChanged={handleStatusChanged}
          />
        ))}

        {/* Create task form */}
        <form onSubmit={handleCreateTask} style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="New task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '6px' }}
          />

          {/* Assignment dropdown — shows all current project members */}
          <select
            value={newTaskAssignedTo}
            onChange={(e) => setNewTaskAssignedTo(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>

          <button type="submit">Add Task</button>
        </form>

        {error && <p style={{ color: 'red', marginTop: '6px' }}>{error}</p>}
      </section>
    </div>
  )
}
