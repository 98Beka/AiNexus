// src/pages/HomePage.tsx
import { useEffect } from 'react'
import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { useAppDispatch } from '../../app/hooks'
import { useGetMyAccountQuery } from '../../entities/auth/authApi'
import { setMyAccount } from '../../entities/auth/authSlice'

export default function HomePage() {
  const dispatch = useAppDispatch()

  const { data: myAccount, isLoading: accountLoading, isFetching: accountFetching, error: accountError } = useGetMyAccountQuery(
    undefined,
    {
      refetchOnFocus: true,
    },
  )

  useEffect(() => {
    if (myAccount) {
      dispatch(setMyAccount(myAccount))
    }
  }, [myAccount, dispatch])


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