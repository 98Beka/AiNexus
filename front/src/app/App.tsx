import { CssBaseline } from '@mui/material'
import { Route, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Layout } from '../shared/ui'
import { AuthPage } from '../pages/auth'
import { HomePage } from '../pages/home'
import ProtectedRoute from './ProtectedRoute'

const router = createBrowserRouter([
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
