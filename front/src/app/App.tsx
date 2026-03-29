import { CssBaseline } from '@mui/material'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Layout } from '../shared/ui'
import { AuthPage } from '../pages/auth'
import HomePage from '../pages/home/HomePage'
import ApplicantSubmitPage from '../pages/home/ApplicantSubmitPage'
import ApplicantTestPage from '../pages/home/ApplicantTestPage'
import ApplicantDetailPage from '../pages/home/ApplicantDetailPage'
import ProtectedRoute from './ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/applicant-submit',
    element: <ApplicantSubmitPage />,
  },
  {
    element: <Layout />,
    children: [
      {
        path: '/auth',
        element: <AuthPage />,
      },
      {
        path: '/applicant-test/:token',
        element: <ApplicantTestPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/',
            element: <HomePage />,
          },
          {
            path: '/applicant/:id',
            element: <ApplicantDetailPage />,
          },
        ],
      },
    ],
  },
])

export default function App() {
  return (
    <>
      <CssBaseline />
      <RouterProvider router={router} />
    </>
  )
}
