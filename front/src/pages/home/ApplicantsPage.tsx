import {
  Alert,
  Box,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Pagination,
} from '@mui/material'
import { useState } from 'react'
import { useGetApplicantsQuery, type ApplicantDto } from '../../entities/applicant/applicantApi'
import { Link } from 'react-router-dom'

export default function ApplicantsPage() {
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, isError } = useGetApplicantsQuery(
    { pageNumber: page, pageSize },
    { refetchOnFocus: true }
  )

  const applicants = data?.items ?? []

  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )

  if (isError) {
    return <Alert severity="error">Ошибка при загрузке заявителей.</Alert>
  }

  return (
    <Box sx={{ width: '100%', px: 2, py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Список заявителей
      </Typography>

      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, width: '100%' }}>
        <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell sx={{ fontWeight: 600, width: '25%' }}>ФИО</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '25%' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '20%' }}>Статус</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '15%' }}>Баллы</TableCell>
              <TableCell sx={{ width: '15%' }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {applicants.map((applicant: ApplicantDto) => (
              <TableRow
                key={applicant.id}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                  '&:hover': { backgroundColor: 'action.selected' },
                }}
              >
                <TableCell sx={{ wordBreak: 'break-word' }}>
                  {applicant.surname} {applicant.name}
                </TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{applicant.email}</TableCell>
                <TableCell>{applicant.status}</TableCell>
                <TableCell>{applicant.score ?? '-'}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/applicant/${applicant.id}`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  >
                    Подробнее
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {data && data.totalCount > pageSize && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(data.totalCount / pageSize)}
            page={page} 
            onChange={(_, value) => setPage(value)} 
            color="primary"
        />
        </Box>
      )}
    </Box>
  )
}