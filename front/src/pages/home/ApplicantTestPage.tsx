import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Button, TextField, Typography, Alert } from '@mui/material'
import { useGetApplicantByTokenQuery, useUpdateApplicantTestMutation } from '../../entities/applicant/applicantApi'

export default function ApplicantTestPage() {
  const { token } = useParams<{ token: string }>()
  const [score, setScore] = useState(0)
  const [details, setDetails] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: applicant, isLoading, isError } = useGetApplicantByTokenQuery(token ?? '', {
    skip: !token,
  })

  const [updateTest, { isLoading: updating }] = useUpdateApplicantTestMutation()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!applicant) return

    try {
      setError(null)
      await updateTest({ id: applicant.id, body: { score, testResultDetails: details } }).unwrap()
      setMessage('Результаты тестирования успешно сохранены.')
    } catch (e) {
      setError('Не удалось сохранить результаты теста.')
    }
  }

  return (
    <Box sx={{ display: 'grid', gap: 2, maxWidth: 600 }}>
      <Typography variant="h4">Тестирование заявителя</Typography>

      {isLoading && <Typography>Загрузка...</Typography>}
      {isError && <Alert severity="error">Ошибка поиска заявителя по токену.</Alert>}

      {applicant && (
        <>
          <Typography>
            <strong>Имя:</strong> {applicant.name} {applicant.surname}
          </Typography>
          <Typography>
            <strong>Email:</strong> {applicant.email}
          </Typography>
          <Typography>
            <strong>Статус:</strong> {applicant.status}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Баллы"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              required
            />
            <TextField
              label="Комментарий по результатам"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              multiline
              rows={4}
            />
            <Button type="submit" variant="contained" disabled={updating}>
              Сохранить результаты теста
            </Button>
          </Box>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </>
      )}
    </Box>
  )
}
