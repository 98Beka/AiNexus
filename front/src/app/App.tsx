import { CssBaseline } from '@mui/material'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Layout } from '../shared/ui'
import { AuthPage } from '../pages/auth'
import { HomePage } from '../pages/home'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
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
