import {
  createBrowserRouter,
  Navigate,
} from 'react-router'

import { useUser } from './context/UserContext'
import Register from './pages/Register'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Profile from './pages/Profile'
import DashboardLayout from './pages/DashboardLayout'
import DashboardHome from './pages/DashboardHome'
import Roadmap from './pages/Roadmap'
import Skills from './pages/Skills'
import Resume from './pages/Resume'
import Recommendations from './pages/Recommendations'
import Onboarding from './pages/Onboarding'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAuthLoading } = useUser()

  if (isAuthLoading) {
    return <div style={{ padding: 40 }}>Checking login session...</div>
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Landing,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <Onboarding />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        Component: DashboardHome,
      },
      {
        path: 'roadmap',
        Component: Roadmap,
      },
      {
        path: 'skills',
        Component: Skills,
      },
      {
        path: 'resume',
        Component: Resume,
      },
      {
        path: 'recommendations',
        Component: Recommendations,
      },
    ],
  },
])



// import { createBrowserRouter } from 'react-router'
// import Landing from './pages/Landing'
// import Login from './pages/Login'
// import Profile from './pages/Profile'
// import DashboardLayout from './pages/DashboardLayout'
// import DashboardHome from './pages/DashboardHome'
// import Roadmap from './pages/Roadmap'
// import Skills from './pages/Skills'
// import Resume from './pages/Resume'
// import Recommendations from './pages/Recommendations'

// export const router = createBrowserRouter([
//   { path: '/', Component: Landing },
//   { path: '/login', Component: Login },
//   { path: '/profile', Component: Profile },
//   {
//     path: '/dashboard',
//     Component: DashboardLayout,
//     children: [
//       { index: true, Component: DashboardHome },
//       { path: 'roadmap', Component: Roadmap },
//       { path: 'skills', Component: Skills },
//       { path: 'resume', Component: Resume },
//       { path: 'recommendations', Component: Recommendations },
//     ],
//   },
// ])
