import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Typography,
  Divider,
  Stack,
} from '@mui/material'
import { useGetMyAccountQuery } from '../../entities/auth/authApi'

export default function AccountPage() {
  const {
    data: myAccount,
    isLoading,
    isFetching,
    error,
  } = useGetMyAccountQuery(undefined, { refetchOnFocus: true })

  if (isLoading || isFetching) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box maxWidth={500} mx="auto" mt={5}>
        <Alert severity="error">Ошибка при загрузке профиля</Alert>
      </Box>
    )
  }

  const initials = [myAccount?.name?.[0], myAccount?.surname?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase()

  const fields = [
    { label: 'Имя',     value: myAccount?.name },
    { label: 'Фамилия', value: myAccount?.surname },
    { label: 'Email',   value: myAccount?.email },
    { label: 'Роль',    value: myAccount?.role },
  ]

  return (
    <Box maxWidth={640} mx="auto" mt={6} px={2}>
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'grey.100',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" gap={2}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'primary.50',
                color: 'primary.main',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {initials}
            </Avatar>

            <Box minWidth={0}>
              <Typography variant="h6" fontWeight={600} noWrap>
                {myAccount?.name} {myAccount?.surname}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {myAccount?.email}
              </Typography>
            </Box>

            <Chip
              label={myAccount?.role}
              size="small"
              sx={{
                ml: 'auto',
                bgcolor: 'success.50',
                color: 'success.dark',
                fontWeight: 600,
                fontSize: 11,
                height: 24,
                flexShrink: 0,
              }}
            />
          </Stack>
        </CardContent>

        <Divider sx={{ borderColor: 'grey.100' }} />

        <CardContent sx={{ p: 3 }}>
          <Box
            display="grid"
            gridTemplateColumns="1fr 1fr"
            gap={1.5}
          >
            {fields.map(({ label, value }) => (
              <Box
                key={label}
                sx={{
                  bgcolor: 'grey.50',
                  borderRadius: 2.5,
                  p: '14px 16px',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'text.disabled',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    mb: 0.5,
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  color="text.primary"
                  noWrap
                >
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>

        <Divider sx={{ borderColor: 'grey.100' }} />
      </Card>
    </Box>
  )
}