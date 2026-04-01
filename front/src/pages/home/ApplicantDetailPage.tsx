import { useParams } from 'react-router-dom'
import { Box, Typography, Alert, Card, Divider } from '@mui/material'
import { useGetApplicantQuery } from '../../entities/applicant/applicantApi'

const DetailSection = ({
                           title,
                           children,
                       }: {
    title?: string
    children: React.ReactNode
}) => (
    <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1, bgcolor: 'background.paper' }}>
        {title && (
            <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
                {title}
            </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {children}
        </Box>
    </Card>
)

const DetailRow = ({
                       label,
                       value,
                   }: {
    label: string
    value?: string | number | null
}) => (
    <Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <span>/</span>
            <Typography variant="body2" fontWeight={500}>
                {value ?? '—'}
            </Typography>
        </Box>
        <Divider sx={{ mt: 1 }} />
    </Box>
)

export default function ApplicantDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { data: applicant, isLoading, isError } = useGetApplicantQuery(id ?? '', {
        skip: !id,
    })

    if (isLoading) return <Typography>Загрузка...</Typography>
    if (isError) return <Alert severity="error">Не удалось загрузить данные заявителя.</Alert>
    if (!applicant) return <Alert severity="info">Заявитель не найден.</Alert>

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            {/* Личные данные */}
            <DetailSection>
                <Box
                    sx={{
                        mt: 1,
                        mb: 2,
                        mx: 'auto',
                        width: 180,
                        height: 220,
                        borderRadius: 2,
                        bgcolor: '#CFCFCF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {applicant.photo && (
                        <Box
                            component="img"
                            src={`data:image/png;base64,${applicant.photo}`}
                            alt="Фото заявителя"
                            sx={{ width: 150, height: 200, borderRadius: '8px', objectFit: 'cover' }}
                        />
                    )}
                </Box>

                <DetailRow label="Имя" value={applicant.name} />
                <DetailRow label="Фамилия" value={applicant.surname} />
                <DetailRow label="Email" value={applicant.email} />
                <DetailRow label="Телефон" value={applicant.phone} />
            </DetailSection>

            {/* Тест */}
            <DetailSection title="Результат теста">
                <DetailRow label="Баллы" value={applicant.score} />
                <DetailRow label="Детали результата" value={applicant.testResultDetails} />
            </DetailSection>

            {/* Статус */}
            <DetailSection title="Статус">
                <DetailRow label="Текущий статус" value={applicant.status} />
                <DetailRow label="Временный токен" value={applicant.temporaryToken} />
                <DetailRow
                    label="Срок действия токена"
                    value={
                        applicant.temporaryTokenExpiresAt
                            ? new Date(applicant.temporaryTokenExpiresAt).toLocaleString()
                            : null
                    }
                />
            </DetailSection>
        </Box>
    )
}