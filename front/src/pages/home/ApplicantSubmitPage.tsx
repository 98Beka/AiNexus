import { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Container,
  Paper,
  Stack,
  CircularProgress,
} from '@mui/material'

import { useCreateApplicantMutation } from '../../entities/applicant/applicantApi'

export default function ApplicantSubmitPage() {
  const [form, setForm] = useState({
    name: '',
    surname: '',
    patronymic: '',
    email: '',
    phone: '',
  })

  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [createApplicant, { isLoading }] = useCreateApplicantMutation()

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      setError(null)

      await createApplicant({
        name: form.name,
        surname: form.surname,
        patronymic: form.patronymic || undefined,
        email: form.email,
        phone: form.phone || undefined,
      }).unwrap()

      setMessage(`Заявка принята. Проверьте почту ${form.email}`)
      setForm({ name: '', surname: '', patronymic: '', email: '', phone: '' })
    } catch {
      setError('Ошибка отправки. Проверьте данные.')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 6,
            alignItems: 'center',
          }}
        >
          {/* Левая часть — как лендинг */}
          <Box>
            <Typography
              variant="h2"
              fontWeight={700}
              color="white"
              sx={{ lineHeight: 1.2 }}
            >
              InDrive U
            </Typography>

            <Typography
              variant="h5"
              color="grey.300"
              sx={{ mt: 2, maxWidth: 400 }}
            >
              Построй карьеру в IT. Пройди отбор и получи доступ к обучению.
            </Typography>

            <Typography
              variant="body1"
              color="grey.400"
              sx={{ mt: 3, maxWidth: 420 }}
            >
              Заполни заявку — мы отправим тестовое задание на email.
            </Typography>
          </Box>

          {/* Правая часть — форма */}
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 4,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h5" fontWeight={600}>
                Подать заявку
              </Typography>

              {message && <Alert severity="success">{message}</Alert>}
              {error && <Alert severity="error">{error}</Alert>}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                    <TextField
                      label="Имя"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                      fullWidth
                    />

                    <TextField
                      label="Фамилия"
                      value={form.surname}
                      onChange={(e) => handleChange('surname', e.target.value)}
                      required
                      fullWidth
                    />

                    <TextField
                      label="Отчество"
                      value={form.patronymic}
                      onChange={(e) => handleChange('patronymic', e.target.value)}
                      fullWidth
                    />
                  </Stack>

                  <TextField
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    fullWidth
                  />

                  <TextField
                    label="Телефон"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    fullWidth
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      mt: 1,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Отправить заявку'
                    )}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  )
}