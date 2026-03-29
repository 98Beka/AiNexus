import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { useGetMyAccountQuery } from '../../entities/auth/authApi'

export default function AccountPage() {
    const {
        data: myAccount,
        isLoading,
        isFetching,
        error,
    } = useGetMyAccountQuery(undefined, {
        refetchOnFocus: true,
    })

    if (isLoading || isFetching) return <CircularProgress />

    if (error) {
        return <Alert severity="error">Ошибка при загрузке профиля.</Alert>
    }

    return (
        <Box sx={{ display: 'grid', gap: 1 }}>
            <Typography variant="h4">Мой аккаунт</Typography>

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
    )
}