import { CssBaseline } from '@mui/material'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Layout } from '../shared/ui'
import { AuthPage } from '../pages/auth'
import HomePage from '../pages/home/HomePage'
import ApplicantDetailPage from '../pages/home/ApplicantDetailPage'
import ProtectedRoute from './ProtectedRoute'
import ApplicantsPage from "../pages/home/ApplicantsPage.tsx";
import AccountPage from "../pages/account/AccountPage.tsx";
import TestPage from '../pages/test/TestPage'
import ApplicantSubmitPage from '../pages/applicant_submit/ApplicantSubmitPage'

const router = createBrowserRouter([
  {
    path: '/applicant-submit',
    element: <ApplicantSubmitPage />,
  },
  {
    path: '/test/:token',
    element: <TestPage />,
  },
  {
    element: <Layout />,
    children: [
      {
        path: '/auth',
        element: <AuthPage />,
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
            {
                path: '/applicants',
                element: <ApplicantsPage />,
            },
            {
                path: '/account',
                element: <AccountPage />,
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
