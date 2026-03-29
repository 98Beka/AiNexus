import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Box, Button, CircularProgress, Container, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useLoginMutation } from '../../entities/auth/authApi'
import { setCredentials } from '../../entities/auth/authSlice'

export default function AuthPage() {
  const dispatch = useAppDispatch()
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
      const response = await login({ email, password }).unwrap()
      dispatch(setCredentials(response))
      setEmail('')
    } catch (e) {
      // Error handled by mutation
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box component="form" onSubmit={submitLogin} sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Login
        </Typography>
        <TextField
          label="Email"
          value={email}
          onChange={(evt) => setEmail(evt.target.value)}
          required
          type="email"
          helperText="Введите ваш email"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(evt) => setPassword(evt.target.value)}
          required
        />
        <Button type="submit" variant="contained" disabled={loginLoading}>
          {loginLoading ? <CircularProgress size={20} /> : 'Login'}
        </Button>
        {loginError ? <Alert severity="error">Не удалось выполнить вход. Проверьте email и пароль.</Alert> : null}
      </Box>
    </Container>
  )
}
