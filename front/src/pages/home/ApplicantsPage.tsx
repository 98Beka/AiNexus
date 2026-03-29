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
} from '@mui/material'
import { useGetApplicantsQuery, type ApplicantDto } from '../../entities/applicant/applicantApi'
import { Link } from 'react-router-dom'

export default function ApplicantsPage() {
    const { data, isLoading, isError } = useGetApplicantsQuery(undefined, {
        refetchOnFocus: true,
    })

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
        <Box sx={{ width: '100%' }}>
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
                        {data?.map((applicant: ApplicantDto) => (
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
        </Box>
    )
}