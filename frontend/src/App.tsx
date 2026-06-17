import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'

// App defines all the routes.
//
// Public routes (/login, /signup) are accessible without a token.
//
// Protected routes are wrapped in <ProtectedRoute />, which redirects to
// /login if no token is found in localStorage.
//
// <Navbar /> acts as a layout shell — it renders the nav bar and then
// renders whichever child page is active via React Router's <Outlet />.

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected pages — auth check happens in ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          {/* Navbar is the layout wrapper; pages render inside its <Outlet /> */}
          <Route element={<Navbar />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          </Route>
        </Route>

        {/* Redirect any unknown path to the dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
