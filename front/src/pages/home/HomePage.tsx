// src/pages/HomePage.tsx
import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { useGetMyAccountQuery } from '../../entities/auth/authApi'

export default function HomePage() {

  const { data: myAccount, isLoading: accountLoading, isFetching: accountFetching, error: accountError } = useGetMyAccountQuery(
    undefined,
    {
      refetchOnFocus: true,
    },
  )


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