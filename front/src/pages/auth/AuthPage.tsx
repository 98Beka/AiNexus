import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Box, Button, CircularProgress, Container, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { useLoginMutation } from '../../entities/auth/authApi'

export default function AuthPage() {
  const navigate = useNavigate()
  const authState = useAppSelector(
    (state) =>
      state.auth as {
        status: 'idle' | 'authenticated' | 'unauthenticated'
      },
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [login, { isLoading: loginLoading, error: loginError }] = useLoginMutation()

  useEffect(() => {
    if (authState.status === 'authenticated') {
      navigate('/')
    }
  }, [authState.status, navigate])

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await login({ email, password }).unwrap()
      navigate('/')
    } catch (e) {
      // Error handled by mutation
    }
  }

  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box
          component="form"
          onSubmit={submitLogin}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            display: 'grid',
            gap: 2.5,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              textAlign: 'center',
              mb: 1,
            }}
          >
            AiNexus Login
          </Typography>

          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loginLoading}
            sx={{
              mt: 1,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              bgcolor: '#2563eb',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#1d4ed8',
                boxShadow: 'none',
              },
            }}
          >
            {loginLoading ? (
              <CircularProgress size={18} sx={{ color: 'white' }} />
            ) : (
              'Login'
            )}
          </Button>

          {loginError && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 2,
              }}
            >
              Не удалось выполнить вход. Проверьте email и пароль.
            </Alert>
          )}
        </Box>
      </Container>
    </Box>
  )
}
