import { AppBar, Toolbar, Typography, Button, Box, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useLogoutMutation } from '../../entities/auth/authApi'
import { logout as logoutAction } from '../../entities/auth/authSlice'

export default function Header() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const authState = useAppSelector(
    (state) =>
      state.auth as {
        token: string | null
        user: {
          id: string
          name: string
          surname: string
          email: string
          role: string
        } | null
        status: 'idle' | 'authenticated' | 'unauthenticated'
      },
  )
  const [logout, { isLoading: logoutLoading }] = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } finally {
      dispatch(logoutAction())
      navigate('/auth')
    }
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          AiNexus
        </Typography>
        {authState.status === 'authenticated' && authState.user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {authState.user.name} {authState.user.surname}
            </Typography>
            <Button color="inherit" onClick={handleLogout} disabled={logoutLoading}>
              {logoutLoading ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : 'Logout'}
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}
