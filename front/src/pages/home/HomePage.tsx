// src/pages/HomePage.tsx
import { Alert, Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material'
import { useGetMyAccountQuery } from '../../entities/auth/authApi'
import { useGetApplicantsQuery } from '../../entities/applicant/applicantApi'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const { data: myAccount, isLoading: accountLoading, isFetching: accountFetching, error: accountError } = useGetMyAccountQuery(undefined, {
    refetchOnFocus: true,
  })

  const { data: applicants, isLoading: applicantsLoading, isError: applicantsError } = useGetApplicantsQuery(undefined, {
    refetchOnFocus: true,
  })

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

      <Typography variant="h4" sx={{ mt: 4 }}>
        Список заявителей
      </Typography>

      {applicantsLoading ? (
        <CircularProgress />
      ) : applicantsError ? (
        <Alert severity="error">Ошибка при загрузке заявителей.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ФИО</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Баллы</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {applicants?.map((applicant) => (
                <TableRow key={applicant.id}>
                  <TableCell>{`${applicant.surname} ${applicant.name}`}</TableCell>
                  <TableCell>{applicant.email}</TableCell>
                  <TableCell>{applicant.status}</TableCell>
                  <TableCell>{applicant.score ?? '-'} </TableCell>
                  <TableCell>
                    <Button component={Link} to={`/applicant/${applicant.id}`} size="small">
                      Подробнее
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}