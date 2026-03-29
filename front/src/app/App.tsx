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
        path: '/',
        element: <Route element={<ProtectedRoute />}>

          <Route path="/" element={<HomePage />} />,
        </Route>
      },
      {
        path: '/auth',
        element: <AuthPage />,
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
