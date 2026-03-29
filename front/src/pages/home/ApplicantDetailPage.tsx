import { useParams } from 'react-router-dom'
import { Box, Typography, Alert } from '@mui/material'
import { useGetApplicantQuery } from '../../entities/applicant/applicantApi'

export default function ApplicantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: applicant, isLoading, isError } = useGetApplicantQuery(id ?? '', {
    skip: !id,
  })

  if (isLoading) return <Typography>Загрузка...</Typography>
  if (isError) return <Alert severity="error">Не удалось загрузить данные заявителя.</Alert>
  if (!applicant) return <Alert severity="info">Заявитель не найден.</Alert>

  return (
    <Box sx={{ display: 'grid', gap: 1, maxWidth: 600 }}>
      <Typography variant="h4">Детали заявителя</Typography>
      <Typography>
        <strong>Имя:</strong> {applicant.name}
      </Typography>
      <Typography>
        <strong>Фамилия:</strong> {applicant.surname}
      </Typography>
      <Typography>
        <strong>Email:</strong> {applicant.email}
      </Typography>
      <Typography>
        <strong>Телефон:</strong> {applicant.phone ?? '-'}
      </Typography>
      <Typography>
        <strong>Статус:</strong> {applicant.status}
      </Typography>
      <Typography>
        <strong>Баллы:</strong> {applicant.score ?? '-'}
      </Typography>
      <Typography>
        <strong>Текст результата:</strong> {applicant.testResultDetails ?? '-'}
      </Typography>
      <Typography>
        <strong>Временный токен:</strong> {applicant.temporaryToken}
      </Typography>
      <Typography>
        <strong>Срок действия токена:</strong> {new Date(applicant.temporaryTokenExpiresAt).toLocaleString()}
      </Typography>
    </Box>
  )
}
