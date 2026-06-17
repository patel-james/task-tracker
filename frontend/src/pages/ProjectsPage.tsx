import { useState, useEffect } from 'react'
import { getProjects, createProject } from '../api/projectApi'
import type { Project } from '../types'
import ProjectCard from '../components/ProjectCard'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [newProjectName, setNewProjectName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getProjects()
      setProjects(data.projects ?? [])
      setLoading(false)
    }
    fetchProjects()
  }, [])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return

    const data = await createProject(newProjectName)

    if (data.projectId) {
      // Add the new project to the list without a full re-fetch
      setProjects((prev) => [
        ...prev,
        {
          id: data.projectId,
          name: newProjectName,
          owner_id: 0, // will be filled in on next page load
          created_at: new Date().toISOString(),
          role: 'owner',
        },
      ])
      setNewProjectName('')
      setError('')
    } else {
      setError(data.message || 'Failed to create project')
    }
  }

  if (loading) return <p>Loading projects...</p>

  return (
    <div>
      <h2>Projects</h2>

      {/* Create project form */}
      <form onSubmit={handleCreateProject} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="New project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          style={{ flex: 1, padding: '6px' }}
        />
        <button type="submit">Create Project</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {projects.length === 0 && <p>You have no projects yet. Create one above.</p>}

      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
