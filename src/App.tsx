import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import CreateDocument from './pages/CreateDocument'
import RecentDocument from './pages/RecentDocument'
import Settings from './pages/Settings'
import ExpertCallAnalysis from './pages/ExpertCallAnalysis'
import MeetingNote from './pages/MeetingNote'
import './App.css'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
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
  return <RouterProvider router={router} />
}

export default App
