import { Navigate, Outlet } from 'react-router-dom'

// Wraps any routes that require the user to be logged in.
// If there is no token in localStorage, the user is sent to /login.
export default function ProtectedRoute() {
  const token = localStorage.getItem('token')
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
