import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import CreateDocument from './pages/CreateDocument'
import RecentDocument from './pages/RecentDocument'
import Settings from './pages/Settings'
import ExpertCallAnalysis from './pages/ExpertCallAnalysis'
import MeetingNote from './pages/MeetingNote'
import Login from './pages/Login'
import { AuthProvider } from './contexts/AuthContext'
import AuthGuard from './components/AuthGuard'
import './App.css'

const router = createBrowserRouter(
  [
    { path: '/login', element: <Login /> },
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
        { path: 'documents', element: <Documents /> },
        { path: 'create', element: <CreateDocument /> },
        { path: 'recent/:id', element: <RecentDocument /> },
        { path: 'settings', element: <Settings /> },
        { path: 'expert-call', element: <ExpertCallAnalysis /> },
        { path: 'meeting-note', element: <MeetingNote /> },
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
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
