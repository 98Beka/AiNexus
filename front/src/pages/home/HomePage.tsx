import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useGetMyAccountQuery } from '../../entities/auth/authApi'
import { setMyAccount } from '../../entities/auth/authSlice'

export default function HomePage() {
  const dispatch = useAppDispatch()
  const authState = useAppSelector(
    (state) =>
      state.auth as {
        status: 'idle' | 'authenticated' | 'unauthenticated'
      },
  )
  const { data: myAccount, isLoading: accountLoading, isFetching: accountFetching, error: accountError } = useGetMyAccountQuery(
    undefined,
    {
      skip: authState.status !== 'authenticated',
      refetchOnFocus: true,
    },
  )

  useEffect(() => {
    if (myAccount) {
      dispatch(setMyAccount(myAccount))
    }
  }, [myAccount, dispatch])

  if (authState.status !== 'authenticated') {
    return <Navigate to="/auth" replace />
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="h4">Мой аккаунт</Typography>
      {accountLoading || accountFetching ? (
        <CircularProgress />
      ) : accountError ? (
        <Alert severity="error">Ошибка при загрузке профиля.</Alert>
      ) : (
        <Box sx={{ display: 'grid', gap: 1 }}>
          <Typography>
            <strong>Имя:</strong> {myAccount?.name}
          </Typography>
          <Typography>
            <strong>Фамилия:</strong> {myAccount?.surname}
          </Typography>
          <Typography>
            <strong>Роль:</strong> {myAccount?.role}
          </Typography>
          <Typography>
            <strong>Email:</strong> {myAccount?.email}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
