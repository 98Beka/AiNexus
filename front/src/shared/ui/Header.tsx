import { AppBar, Toolbar, Typography, Button, Box, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useLogoutMutation } from '../../entities/auth/authApi'
import { logout } from '../../entities/auth/authSlice'

export default function Header() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, status } = useAppSelector((state) => state.auth)

  const [logoutReq, { isLoading }] = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logoutReq().unwrap()
    } finally {
      dispatch(logout())
      navigate('/auth')
    }
  }

  if (status !== 'authenticated' || !user) {
    return (
<AppBar
  position="static"
  elevation={0}
  sx={{
    bgcolor: '#0f172a',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  }}
>
  <Toolbar
    variant="dense"
    sx={{
      minHeight: 52,
      px: 3,
      display: 'flex',
      justifyContent: 'space-between',
    }}
  >
          <Typography >AiNexus</Typography>
        </Toolbar>
      </AppBar>
    )
  }

  return (
<AppBar
  position="static"
  elevation={0}
  sx={{
    bgcolor: '#0f172a',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  }}
>
  <Toolbar
    variant="dense"
    sx={{
      minHeight: 52,
      px: 3,
      display: 'flex',
      justifyContent: 'space-between',
    }}
  >
    <Typography
      variant="subtitle1"
      sx={{
        fontWeight: 600,
        letterSpacing: 0.5,
      }}
    >
      AiNexus
    </Typography>

    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          px: 1.8,
          py: 0.6,
          borderRadius: 3,
          bgcolor: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(6px)',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {user.name}
      </Box>

      <Button
        variant="contained"
        size="small"
        onClick={handleLogout}
        disabled={isLoading}
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          px: 2,
          bgcolor: '#2563eb',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: '#1d4ed8',
            boxShadow: 'none',
          },
        }}
      >
        {isLoading ? (
          <CircularProgress size={16} sx={{ color: 'white' }} />
        ) : (
          'Logout'
        )}
      </Button>
    </Box>
  </Toolbar>
</AppBar>
  )
}