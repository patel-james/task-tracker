import { Link, useNavigate, Outlet } from 'react-router-dom'

// Layout wrapper: renders the nav bar at the top, then the current page below via <Outlet />.
export default function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <>
      <nav style={{ padding: '10px 20px', borderBottom: '1px solid #ccc', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <strong>Task Tracker</strong>
        <Link to="/">Dashboard</Link>
        <Link to="/projects">Projects</Link>
        <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>
          Logout
        </button>
      </nav>
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </>
  )
}
