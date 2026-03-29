import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { useAppDispatch, useAppSelector } from './hooks'
import { useGetMyAccountQuery, useLoginMutation, useLogoutMutation } from '../entities/auth/authApi'
import { logout as logoutAction, setCredentials, setMyAccount } from '../entities/auth/authSlice'

export default function App() {
  const dispatch = useAppDispatch()
  const authState = useAppSelector((state) => state.auth as {
    token: string | null
    refreshToken: string | null
    user: {
      id: string
      name: string
      surname: string
      patronymic?: string
      pin: string
      role: string
    } | null
    status: 'idle' | 'authenticated' | 'unauthenticated'
  })
  const [pin, setPin] = useState('')
  const [password, setPassword] = useState('')
  const [login, { isLoading: loginLoading, error: loginError }] = useLoginMutation()
  const [logout, { isLoading: logoutLoading }] = useLogoutMutation()
  const { data: myAccount, isLoading: accountLoading, isFetching: accountFetching, error: accountError } = useGetMyAccountQuery(undefined, {
    skip: authState.status !== 'authenticated',
    refetchOnFocus: true,
  })

  useEffect(() => {
    if (myAccount) {
      dispatch(setMyAccount(myAccount))
    }
  }, [myAccount, dispatch])

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const response = await login({ pin, password }).unwrap()
      dispatch(setCredentials(response))
      setPin('')
      setPassword('')
    } catch (e) {
      // handled by RTK Query hook error
    }
  }

  const submitLogout = async () => {
    try {
      await logout().unwrap()
    } finally {
      dispatch(logoutAction())
    }
  }

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AiNexus
          </Typography>
          {authState.status === 'authenticated' ? (
            <Button color="inherit" onClick={submitLogout} disabled={logoutLoading}>
              {logoutLoading ? <CircularProgress color="inherit" size={20} /> : 'Logout'}
            </Button>
          ) : null}
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        {authState.status !== 'authenticated' ? (
          <Box component="form" onSubmit={submitLogin} sx={{ display: 'grid', gap: 2 }}>
            <Typography variant="h5">Login</Typography>
            <TextField
              label="PIN (14 цифр)"
              value={pin}
              onChange={(evt) => setPin(evt.target.value)}
              required
              inputProps={{ maxLength: 14 }}
              helperText="Введите PIN из 14 цифр"
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
            {loginError ? <Alert severity="error">Не удалось выполнить вход. Проверьте PIN и пароль.</Alert> : null}
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Typography variant="h5">Мой аккаунт</Typography>
            {accountLoading || accountFetching ? (
              <CircularProgress />
            ) : accountError ? (
              <Alert severity="error">Ошибка при загрузке профиля.</Alert>
            ) : (
              <Box>
                <Typography>Имя: {myAccount?.name}</Typography>
                <Typography>Фамилия: {myAccount?.surname}</Typography>
                <Typography>Роль: {myAccount?.role}</Typography>
                <Typography>PIN: {myAccount?.pin}</Typography>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </>
  )
}
