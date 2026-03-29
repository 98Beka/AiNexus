import { useState } from 'react'
import { Box, Button, TextField, Typography, Alert, Container } from '@mui/material'
import { useCreateApplicantMutation } from '../../entities/applicant/applicantApi'

export default function ApplicantSubmitPage() {
  const [form, setForm] = useState({ name: '', surname: '', patronymic: '', email: '', phone: '' })
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [createApplicant, { isLoading }] = useCreateApplicantMutation()

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setError(null)
      await createApplicant({
        name: form.name,
        surname: form.surname,
        patronymic: form.patronymic || undefined,
        email: form.email,
        phone: form.phone || undefined,
      }).unwrap()
      setMessage(
        `Заявка принята. На почту ${form.email} отправлена ссылка на тест`,
      )
      setForm({ name: '', surname: '', patronymic: '', email: '', phone: '' })
    } catch (e) {
      setError('Не удалось отправить заявку. Проверьте данные и попробуйте снова.')
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ display: 'grid', gap: 2, maxWidth: 500 }}>
        <Typography variant="h4">Отправка заявки</Typography>
        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Имя"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
          <TextField
            label="Фамилия"
            value={form.surname}
            onChange={(e) => handleChange('surname', e.target.value)}
            required
          />
          <TextField
            label="Отчество"
            value={form.patronymic}
            onChange={(e) => handleChange('patronymic', e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
          <TextField
            label="Телефон"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
          <Button type="submit" variant="contained" disabled={isLoading}>
            Отправить заявку
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
