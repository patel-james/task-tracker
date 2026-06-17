import { useNavigate } from 'react-router-dom'
import type { Project } from '../types'

type Props = {
  project: Project
}

// Displays a single project as a clickable card.
export default function ProjectCard({ project }: Props) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      style={{
        border: '1px solid #ccc',
        borderRadius: '6px',
        padding: '12px 16px',
        marginBottom: '10px',
        cursor: 'pointer',
      }}
    >
      <strong>{project.name}</strong>
      <span style={{ marginLeft: '12px', color: '#666', fontSize: '0.85em' }}>
        Role: {project.role}
      </span>
    </div>
  )
}
