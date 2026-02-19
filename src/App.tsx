import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Research from './pages/Research'
import Tasks from './pages/Tasks'
import HistoryChat from './pages/HistoryChat'
import CreateDocument from './pages/CreateDocument'
import CreateAgent from './pages/CreateAgent'
import AgentsList from './pages/AgentsList'
import AgentDetail from './pages/AgentDetail'
import RecentDocument from './pages/RecentDocument'
import Settings from './pages/Settings'
import ExpertCallAnalysis from './pages/ExpertCallAnalysis'
import MeetingNote from './pages/MeetingNote'
import Admin from './pages/Admin'
import Login from './pages/Login'
import AuthGuard from './components/AuthGuard'
import {
  AuthenticateWithRedirectCallback,
  ClerkProvider,
} from '@clerk/clerk-react'
import './App.css'

const router = createBrowserRouter(
  [
    { path: '/login/sso-callback', element: <AuthenticateWithRedirectCallback /> },
    { path: '/login/*', element: <Login /> },
    {
      path: '/',
      element: (
        <AuthGuard>
          <Layout />
        </AuthGuard>
      ),
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'documents', element: <Research /> },
        { path: 'research', element: <Research /> },
        { path: 'tasks', element: <Tasks /> },
        { path: 'agents', element: <AgentsList /> },
        { path: 'agents/create', element: <CreateAgent /> },
        { path: 'agents/:id', element: <AgentDetail /> },
        { path: 'history/:id', element: <HistoryChat /> },
        { path: 'create', element: <CreateDocument /> },
        { path: 'recent/:id', element: <RecentDocument /> },
        { path: 'settings', element: <Settings /> },
        { path: 'expert-call', element: <ExpertCallAnalysis /> },
        { path: 'meeting-note', element: <MeetingNote /> },
        { path: 'admin', element: <Admin /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
)

function App() {
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  const clerkDomain = import.meta.env.VITE_CLERK_DOMAIN
  const clerkJSUrl =
    import.meta.env.VITE_CLERK_JS_URL ||
    'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js'

  if (!clerkKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-sm text-gray-700">
        Configuration Clerk manquante.
      </div>
    )
  }

  return (
    <ClerkProvider
      publishableKey={clerkKey}
      clerkJSUrl={clerkJSUrl}
      domain={clerkDomain || undefined}
    >
      <RouterProvider router={router} />
    </ClerkProvider>
  )
}

export default App
