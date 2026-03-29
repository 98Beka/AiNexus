import { AppBar, Toolbar, Typography, Button, Box, CircularProgress, Skeleton } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useGetMyAccountQuery, useLogoutMutation } from '../../entities/auth/authApi'
import { logout } from '../../entities/auth/authSlice'

export default function Header() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status } = useAppSelector((state) => state.auth)
  const { data: myAccount, isLoading: isAccountLoading } = useGetMyAccountQuery(undefined, {
    skip: status !== 'authenticated',
  })
  const [logoutReq, { isLoading }] = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logoutReq(undefined).unwrap()
    } finally {
      dispatch(logout())
      navigate('/auth')
    }
  }

  if (status !== 'authenticated') {
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
      <Button
        variant="outlined"
        size="small"
        onClick={() => navigate('/applicant-submit')}
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          px: 2,
          color: 'white',
          borderColor: 'rgba(255,255,255,0.3)',
          '&:hover': { borderColor: 'rgba(255,255,255,0.7)' },
        }}
      >
        Новая заявка
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={() => navigate('/')}
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          px: 2,
          color: 'white',
          borderColor: 'rgba(255,255,255,0.3)',
          '&:hover': { borderColor: 'rgba(255,255,255,0.7)' },
        }}
      >
        Заявители
      </Button>
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
        {isAccountLoading ? (
          <Skeleton variant="text" width={80} sx={{ bgcolor: 'grey.700' }} />
        ) : (
          myAccount?.name
        )}
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