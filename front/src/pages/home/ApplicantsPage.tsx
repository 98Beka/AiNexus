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

    if (isLoading) return <CircularProgress />

    if (isError) {
        return <Alert severity="error">Ошибка при загрузке заявителей.</Alert>
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Список заявителей
            </Typography>

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
                        {data?.map((applicant: ApplicantDto) => (
                            <TableRow key={applicant.id}>
                                <TableCell>
                                    {applicant.surname} {applicant.name}
                                </TableCell>
                                <TableCell>{applicant.email}</TableCell>
                                <TableCell>{applicant.status}</TableCell>
                                <TableCell>{applicant.score ?? '-'}</TableCell>
                                <TableCell>
                                    <Button
                                        component={Link}
                                        to={`/applicant/${applicant.id}`}
                                        size="small"
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