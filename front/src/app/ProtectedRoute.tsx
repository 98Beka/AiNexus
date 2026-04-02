// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { Box, CircularProgress } from '@mui/material'

export default function ProtectedRoute() {
  const authStatus = useAppSelector((state) => state.auth.status)

  if (authStatus === 'idle') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width:'100%', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (authStatus !== 'authenticated') {
    return <Navigate to="/auth" replace />
  }

  return <Outlet />
}